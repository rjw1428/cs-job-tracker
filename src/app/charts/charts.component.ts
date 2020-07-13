import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { State } from '../root.reducers';
import { BackendService } from '../service/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { TitleCasePipe } from '@angular/common';
export interface Chart {
  id: string;
  name: string;
  dataTableName: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  dataSource?: any[]
  chartType: string;
  seriesName?: string
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartsComponent implements OnInit {
  sidebarWidth$: Observable<number>;
  selectedTabOnLoad: number
  charts: Chart[] = [{
    id: 'estimators_total',
    name: 'Estimate Total',
    dataTableName: 'chart_total_estimates_by_estimator',
    chartType: "bar_vertical"
  }, {
    id: 'estimators_count',
    name: 'Estimate Counts',
    dataTableName: 'chart_total_estimates_by_estimator',
    chartType: "pie"
  }, {
    id: 'awarded_by_contractor',
    name: 'Awarded Bids By Contractor',
    dataTableName: 'chart_awards_by_gc',
    chartType: "bar_vertical"
  }, {
    id: 'awarded_by_month',
    name: 'Awarded Bids By Month',
    dataTableName: 'chart_awards_by_month',
    chartType: "single_line",
    seriesName: "Awards"
  }]
  constructor(
    private store: Store<State>,
    private backendService: BackendService,
    private route: ActivatedRoute
  ) {
    this.charts.forEach(chart => chart.dataSource = [])
  }


  ngOnInit(): void {
    this.sidebarWidth$ = this.store.pipe(map(state => state.app.sidebarWidth - state.app.defaultSidebarWidth))
    this.route.paramMap.subscribe((paramsMap: Params) => {
      const selectedChartId = paramsMap.params.chartId
      const matchingIndex = this.charts.findIndex(chart => chart.id == selectedChartId)
      this.selectedTabOnLoad = matchingIndex == -1 ? 0 : matchingIndex
      this.onTabChanged(this.selectedTabOnLoad)
    })
  }

  onTabChanged(tabNumber: number) {
    const titlePipe = new TitleCasePipe()
    const activeChart = this.charts[tabNumber]
    this.updateRouterParams(this.charts[tabNumber].id)
    this.backendService.getData(activeChart.dataTableName)
      .subscribe((resp: any[]) => {
        activeChart.xAxisLabel = titlePipe.transform(Object.keys(resp[0])[0])
        activeChart.yAxisLabel = titlePipe.transform(Object.keys(resp[0])[1])
        switch (activeChart.chartType) {
          case ('bar_vertical'):
            activeChart.dataSource = this.barChart(resp)
            break;
          case ('single_line'):
            activeChart.dataSource = this.singleLineChart(resp, activeChart.seriesName)
            break;
          case ('pie'):
            activeChart.dataSource = this.barChart(resp)
            break;
          case ('pie_advanced'):
            activeChart.dataSource = this.barChart(resp)
            break;
        }

      })
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
}
