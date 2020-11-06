import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, of, forkJoin, throwError, iif, noop, Subscription, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../models/appState';
import { BackendService } from '../../services/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
// import { AppActions } from '../shared/app.action-types';
// import { currentSidebarWidth, chartSelector, timeShorcutSelector } from '../../shared/app.selectors';


import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { first, map, switchMap, catchError, tap, filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeShortcut } from '../../../models/timeShortcut';
import { ChartConfig } from 'src/models/chartConfig';
import { ChartsActions } from './charts.action-types';
import { AppActions } from 'src/app/app.action-types';
import { activeIndexSelector, chartSpecificTimeShortcutSelector, selectedTimeSelector } from './charts.selectors';
import { EventService } from 'src/app/services/event.service';
import { RawTimeShortcut } from 'src/models/rawTimeShortcut';
import { showSnackbar } from 'src/app/shared/utility';
import { convertRawShortcut } from 'src/app/shared/utility'

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
})
export class ChartsComponent implements OnInit, OnDestroy {
  initialTab$: Observable<number>
  timeShortcuts$: Observable<any[]>
  charts$: Observable<ChartConfig[]>
  charts: ChartConfig[] = []
  timeShortcuts: TimeShortcut[] = []
  selectedIndex: number
  selectedChart$: Observable<ChartConfig>
  ganttChart: am4charts.XYChart;
  timeframe: { start: number, end: number }
  currentTab: number
  selectedShortcut: string
  dataSubscription: Subscription
  yAxisLabelRight: string = 'Outsourcing Cost ($)';
  legendPosition = 'right';
  xAxisLabel = 'Month';
  yAxisLabel = 'Estimate Count';
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };

  comboBarScheme = {
    name: 'singleLightBlue',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b']
  }
  footer: string
  refreshInterval: any;
  constructor(
    private store: Store<AppState>,
    private backendService: BackendService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnDestroy() {
    if (this.dataSubscription)
      this.dataSubscription.unsubscribe()
    clearInterval(this.refreshInterval)
  }

  ngOnInit(): void {
    this.store.dispatch(AppActions.initApp())
    this.initialTab$ = this.store.pipe(
      first(),
      map(state => state.app.chartConfigs),
      switchMap(charts => {
        this.charts = JSON.parse(JSON.stringify(charts))
        const onLoadIndex = this.route.paramMap.pipe(
          first(),
          map((paramsMap: Params) => {
            const selectedChartId = paramsMap.params.chartId
            const matchingIndex = charts.findIndex(chart => chart.id == selectedChartId)
            const resultingIndex = matchingIndex == -1 ? 0 : matchingIndex
            if (charts.length)
              this.onTabChanged(resultingIndex, true)
            return resultingIndex
          })
        )
        return onLoadIndex
      }),
      catchError(err => throwError(err)))

    this.refreshInterval = setInterval(() => {
      console.log("UPDATE")
      this.onTabChanged(this.currentTab, false)
    }, 60 * 1000)
  }

  onTabChanged(tabNumber: number, init: boolean) {
    this.store.dispatch(AppActions.startLoading())
    const activeChart = this.charts[tabNumber]
    this.timeShortcuts$ = this.store.pipe(
      first(),
      map(state => state.app.timeShortcuts.map(sc => convertRawShortcut(sc))),
      map(shortcuts => {
        return shortcuts.filter(shortcut => {
          return activeChart.excludedTimes && activeChart.excludedTimes.length
            ? !activeChart.excludedTimes.includes(shortcut.id)
            : true
        })
      }),
      tap((shortcuts: TimeShortcut[]) => {
        // Set default time
        if (!shortcuts.length || !init) return
        const defaultTime = shortcuts.find(sc => sc.id == activeChart.defaultTime ? activeChart.defaultTime : 'last_year')
        this.selectedShortcut = defaultTime
          ? activeChart.defaultTime ? activeChart.defaultTime : 'last_year'
          : shortcuts[0].id

        const selectedTime = shortcuts.find(sc => sc.id == this.selectedShortcut)
        this.timeframe = { start: selectedTime.start(new Date()).getTime() / 1000, end: selectedTime.end(new Date()).getTime() / 1000 }
      })
    )


    this.dataSubscription = this.timeShortcuts$.pipe(
      switchMap(shortcuts => {
        // Set time
        if (!shortcuts.length) return of(null)
        const timeClause = { start: this.timeframe.start, end: this.timeframe.end }
        this.currentTab = tabNumber
        return this.backendService.fetchData(activeChart.storedProcedure, timeClause)
      }))

      .subscribe(
        (resp: any[]) => {
          if (resp) {
            this.updateRouterParams(activeChart.id)
            if (this.ganttChart)
              this.ganttChart.dispose();
            this.setChartFromData(resp, activeChart)
          }
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error.sqlMessage)
          this.store.dispatch(AppActions.stopLoading())
        },
        () => {
          this.store.dispatch(AppActions.stopLoading())
        }
      )
  }

  onDateRangeSet(dateRange: { from: Date, to: Date }) {
    this.timeframe = { start: dateRange.from.getTime() / 1000, end: dateRange.to.getTime() / 1000 }
    this.onTabChanged(this.currentTab, false)
  }

  setChartFromData(resp: any[], chart: ChartConfig) {
    if (resp.length) {

      this.footer = chart.footer
        ? resp.reduce((acc, cur) => acc + cur[chart.footer], 0).toString()
        : ""
      const titlePipe = new TitleCasePipe()
      chart.xAxisLabel = titlePipe.transform(Object.keys(resp[0])[0])
      chart.yAxisLabel = titlePipe.transform(Object.keys(resp[0])[1])
      switch (chart.chartType) {
        case ('bar_vertical'):
          chart.dataSource = this.barChart(resp)
          break;
        case ('bar_horizontal'):
          chart.dataSource = this.multiBarChart(resp)
          break;
        case ('single_line'):
          chart.dataSource = this.lineChart(resp)
          break;
        case ('pie'):
          chart.dataSource = this.pieChart(resp)
          break;
        case ('pie_advanced'):
          chart.dataSource = this.barChart(resp)
          break;
        case ('gantt'):
          this.createGanttChart(resp)
          break;
        case ('combo'):
          chart['dataSource1'] = this.barChart(resp.map(dataPoint => {
            const keys = Object.keys(dataPoint)
            return {
              [keys[0]]: dataPoint[keys[0]],
              [keys[1]]: dataPoint[keys[1]]
            }
          }))
          const series2 = resp.map(dataPoint => Object.keys(dataPoint)
            .filter((key, i) => i != 1)
            .map(key => ({ [key]: dataPoint[key] }))
            .reduce((acc, cur) => ({ ...acc, ...cur }), {}))

          chart['dataSource2'] = this.lineChart(series2)
          break;
      }
    }
  }

  updateRouterParams(chartId) {
    window.history.replaceState({}, '', `/charts/${chartId}`);
  }

  createGanttChart(data) {
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartDiv", am4charts.XYChart);
    chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";
    chart.paddingRight = 20;
    let colorSet = new am4core.ColorSet();
    let seriesNames = Object.keys(data.map(dataPoint => ({ [dataPoint.name]: 0 })).reduce((acc, cur) => ({ ...acc, ...cur }), {}));
    chart.data = data.map(dataPoint => ({ ...dataPoint, color: colorSet.getIndex(8 + 2 * seriesNames.findIndex(name => name == dataPoint.name)) }))

    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.dateFormatter.dateFormat = "yyyy-MM-dd HH:mm";
    dateAxis.renderer.minGridDistance = 70;
    dateAxis.baseInterval = { count: 30, timeUnit: "day" };
    dateAxis.renderer.tooltipLocation = 0;

    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.columns.template.width = am4core.percent(80);
    series1.columns.template.tooltipText = "{name}: {openDateX} - {dateX}";

    series1.dataFields.openDateX = "fromDate";
    series1.dataFields.dateX = "toDate";
    series1.dataFields.categoryY = "name";
    series1.columns.template.propertyFields.fill = "color";
    series1.columns.template.propertyFields.stroke = "color";
    series1.columns.template.strokeOpacity = 1;

    chart.scrollbarX = new am4core.Scrollbar();

    this.ganttChart = chart;
  }

  lineChart(data: any[]) {
    const keys = Object.keys(data[0])
    const seriesNames = keys.slice(1)
    return seriesNames.map(singleSeriesName => {
      const series = data.map(dataPoint => {
        return {
          name: dataPoint[keys[0]],
          value: dataPoint[singleSeriesName]
            ? dataPoint[singleSeriesName]
            : 0
        }
      })
      return { name: singleSeriesName, series }
    })
  }

  barChart(data: any[]) {
    console.log(data)
    const keys = Object.keys(data[0])
    const bars = keys.slice(1)
    debugger
    const seriesNames = data.map(dataPoint => dataPoint[keys[0]])
    const result = seriesNames.map((singleSeriesName, i) => {
      return bars.map(bar => {
        return {
          name: singleSeriesName,
          value: data[i][bar]
            ? data[i][bar]
            : 0,
        }
      }).reduce((acc, cur) => ({ ...acc, ...cur }), {})
    })
    return result
  }

  multiBarChart(data: any[]) {
    console.log(data)
    const keys = Object.keys(data[0])
    const bars = keys.slice(1)
    debugger
    const seriesNames = data.map(dataPoint => dataPoint[keys[0]])
    const result = seriesNames.map((singleSeriesName, i) => {
      return {
        name: singleSeriesName,
        series: bars.map(bar => {
          return {
            name: bar,
            value: data[i][bar]
              ? data[i][bar]
              : 0,
          }
        })
      }
    })//.reduce((acc, cur) => ({ ...acc, ...cur }), {})
    return result
  }


  pieChart(data: any[]) {
    return data.map(dataPoint => {
      const keys = Object.keys(dataPoint)
      return {
        name: `${dataPoint[keys[0]]}: ${dataPoint[keys[1]]}`,
        value: dataPoint[keys[1]] ? dataPoint[keys[1]] : 0
      }
    });
  }

  onRefresh() {
    this.backendService.refreshBackend('charts')
  }
}
