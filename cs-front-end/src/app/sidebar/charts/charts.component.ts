import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, of, forkJoin, throwError, iif, noop, Subscription } from 'rxjs';
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
import { chartConfigSelector, activeIndexSelector, selectedChartConfigSelector, chartSpecificTimeShortcutSelector } from './charts.selectors';
import { EventService } from 'src/app/services/event.service';
import { RawTimeShortcut } from 'src/models/rawTimeShortcut';


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartsComponent implements OnInit, OnDestroy {
  selectedTab$: Observable<number>
  timeShortcuts$: Observable<TimeShortcut[]>
  charts$: Observable<ChartConfig[]>
  ganttChart: am4charts.XYChart;
  // timeframe: { from: number, to: number }
  currentTab: number
  selectedShortcut: string
  ganttChartEventSubscription: Subscription
  updateRouterSubscription: Subscription

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

  constructor(
    private store: Store<AppState>,
    private backendService: BackendService,
    private eventService: EventService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnDestroy() {
    if (this.ganttChart)
      this.ganttChart.dispose()
    this.ganttChartEventSubscription.unsubscribe()
    this.updateRouterSubscription.unsubscribe()
  }

  ngOnInit(): void {
    this.store.dispatch(ChartsActions.initCharts())
    this.timeShortcuts$ = this.store.select(chartSpecificTimeShortcutSelector)
    this.charts$ = this.store.select(chartConfigSelector)
    this.selectedTab$ = this.store.select(activeIndexSelector)

    // Gantt chart special load
    this.ganttChartEventSubscription = this.eventService.createGanttChart
      .subscribe(config => {
        setTimeout(() => {
          this.createGanttChart(config.dataSource)
        }, 0)
      })

    // On Load, store the chart config ID
    this.route.paramMap.pipe(
      first(),
      map((paramsMap: Params) => paramsMap.params.chartId),
      tap(chartId => this.store.dispatch(ChartsActions.setInitialChartId({ chartId })))
    ).subscribe(noop)

    // Update Router params as chart changes
    this.updateRouterSubscription = this.store.select(selectedChartConfigSelector).pipe(
      tap(config => {
        if (config) this.updateRouterParams(config.id)
      })
    ).subscribe(noop)
  }

  updateRouterParams(chartId) {
    window.history.replaceState({}, '', `/charts/${chartId}`);
  }

  onTabChanged(index: number) {
    this.store.dispatch(AppActions.startLoading())
    this.store.dispatch(ChartsActions.setSelectedChartByIndex({ index }))
    this.currentTab = index
  }


  createGanttChart(data) {
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";
    chart.paddingRight = 20;
    let colorSet = new am4core.ColorSet();
    let seriesNames = Object.keys(data.map(dataPoint => ({ [dataPoint.name]: 0 })).reduce((acc, cur) => ({ ...acc, ...cur }), {}));
    chart.data = data.map(dataPoint => ({ ...dataPoint, color: colorSet.getIndex(8 + 2 * seriesNames.findIndex(name => name == dataPoint.name)) }))
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.dateFormatter.dateFormat = "yyyy-MM-dd";
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


  onDateRangeSet({ from, to }: { from: Date, to: Date }) {
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime() / 1000
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime() / 1000
    this.store.dispatch(ChartsActions.setSelectedTime({ start, end }))
    this.onTabChanged(this.currentTab)
  }

  onRefresh() {
    this.backendService.refreshBackend('charts')
  }

}
