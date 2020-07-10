import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { State } from '../root.reducers';
import { BackendService } from '../service/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
export interface Chart {
  id: string;
  name: string;
  dataTableName: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  dataSource?: any[]
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
    id: 'estimators',
    name: 'Estimate Counts',
    dataTableName: 'chart_total_estimates_by_estimator'
  }, {
    id: 'awarded',
    name: 'Awarded Bids',
    dataTableName: 'chart_awards_by_gc'
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
    const activeChart = this.charts[tabNumber]
    this.updateRouterParams(this.charts[tabNumber].id)
    this.backendService.getData(activeChart.dataTableName)
      .subscribe((resp: any[]) => {
        activeChart.xAxisLabel = Object.keys(resp[0])[0]
        activeChart.yAxisLabel = Object.keys(resp[0])[1]
        activeChart.dataSource = resp.map(data => ({ name: data[activeChart.xAxisLabel], value: data[activeChart.yAxisLabel] }));
      })
  }

  updateRouterParams(chartId) {
    window.history.replaceState({}, '', `/charts/${chartId}`);
  }
}
