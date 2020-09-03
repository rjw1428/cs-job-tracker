import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, of, forkJoin, throwError, iif } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { State } from '../root.reducers';
import { BackendService } from '../service/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { AppActions } from '../shared/app.action-types';
import { currentSidebarWidth, chartSelector, timeShorcutSelector } from '../shared/app.selectors';


import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { first, map, switchMap, catchError, tap, filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { showSnackbar } from '../shared/utility';
import { TimeShortcut } from '../filter/filter.component';

export interface Chart {
  id: string;
  name: string;
  storedProcedure: string;
  defaultTime: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  dataSource?: any[]
  chartType: string;
  seriesName?: string;
  excludedTimes: string[]
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartsComponent implements OnInit, AfterViewInit {
  selectedTabOnLoad$: Observable<number>
  timeShortcuts$: Observable<TimeShortcut[]>
  charts: Chart[] = []
  ganttChart: am4charts.XYChart;
  timeframe: { from: Date, to: Date }
  currentTab: number
  selectedShortcut: string
  constructor(
    private store: Store<State>,
    private backendService: BackendService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.charts.forEach(chart => chart.dataSource = [])
  }


  ngOnInit(): void {
    this.selectedTabOnLoad$ = this.store.select(chartSelector).pipe(
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
  }

  onTabChanged(tabNumber: number, init: boolean) {
    this.store.dispatch(AppActions.startLoading())
    const activeChart = this.charts[tabNumber]
    this.timeShortcuts$ = this.store.select(timeShorcutSelector)
      .pipe(
        first(),
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
            this.timeframe = { from: selectedTime.start(new Date()), to: selectedTime.end(new Date()) }
        })
      )


    this.timeShortcuts$.pipe(
      switchMap(shortcuts => {
        // Set time
        if (!shortcuts.length) return of(null)
        const start = new Date(this.timeframe.from.getFullYear(), this.timeframe.from.getMonth(), this.timeframe.from.getDate()).getTime() / 1000
        const end = new Date(this.timeframe.to.getFullYear(), this.timeframe.to.getMonth(), this.timeframe.to.getDate()).getTime() / 1000
        const timeClause = { start, end }
        this.currentTab = tabNumber
        return this.backendService.getChart(activeChart.storedProcedure, timeClause)
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
          showSnackbar(this.snackBar, err.error.error)
          this.store.dispatch(AppActions.stopLoading())
        },
        () => {
          this.store.dispatch(AppActions.stopLoading())
        }
      )
  }

  setChartFromData(resp: any[], chart: Chart) {
    if (resp.length) {
      const titlePipe = new TitleCasePipe()
      chart.xAxisLabel = titlePipe.transform(Object.keys(resp[0])[0])
      chart.yAxisLabel = titlePipe.transform(Object.keys(resp[0])[1])
      switch (chart.chartType) {
        case ('bar_vertical'):
          chart.dataSource = this.barChart(resp)
          break;
        case ('bar_horizontal'):
          chart.dataSource = this.barChart(resp)
          break;
        case ('single_line'):
          chart.dataSource = this.singleLineChart(resp, chart.seriesName)
          break;
        case ('pie'):
          chart.dataSource = this.barChart(resp)
          break;
        case ('pie_advanced'):
          chart.dataSource = this.barChart(resp)
          break;
        case ('gantt'):
          this.createGanttChart(resp)
          break;
      }
    }
  }

  updateRouterParams(chartId) {
    window.history.replaceState({}, '', `/charts/${chartId}`);
  }

  singleLineChart(data: any[], name) {
    const series = data.map(dataPoint => {
      const keys = Object.keys(dataPoint)
      return {
        name: dataPoint[keys[0]],
        value: dataPoint[keys[1]]
      }
    })
    return [{ name, series }]
  }

  barChart(data: any[]) {
    return data.map(dataPoint => {
      const keys = Object.keys(dataPoint)
      return {
        name: dataPoint[keys[0]],
        value: dataPoint[keys[1]]
      }
    });
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

  onDateRangeSet(dateRange: { from: Date, to: Date }) {
    this.timeframe = dateRange
    this.onTabChanged(this.currentTab, false)
  }


  ngAfterViewInit() {
    // NEEDED FOR THE FIRST LOAD OF THE GANTT CHART
    // if (this.activeChart && this.activeChart.chartType == 'gantt' && !this.viewRendered) {
    //   this.onTabChanged(this.selectedTabOnLoad)
    // }
    // this.viewRendered = true
  }
}
