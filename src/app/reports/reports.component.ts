import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../service/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { saveAs } from 'file-saver'
import { D } from '@angular/cdk/keycodes';
import { convertJsonToCSV } from '../shared/utility';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { State } from '../root.reducers';
import { AppActions } from '../shared/app.action-types';
import { CurrencyPipe } from '@angular/common';
import { reportSelector } from '../shared/app.selectors';
import { Observable, throwError } from 'rxjs';
import { switchMap, first, map, catchError } from 'rxjs/operators';

export interface Report {
  id: string;
  name: string;
  dataTableName: string;
  displayedColumns?: string[];
  dataSource?: MatTableDataSource<any>
  footer?: string
}
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  displayedColumns: string[]
  dataSource: any
  selectedTabOnLoad$: Observable<number>

  reports: Report[] = []
  sortCol: string
  footer: string
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    private store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.selectedTabOnLoad$ = this.store.select(reportSelector).pipe(
      switchMap(reports => {
        console.log(reports)
        this.reports = JSON.parse(JSON.stringify(reports))
        const onLoadIndex = this.route.paramMap.pipe(
          first(),
          map((paramsMap: Params) => {
            const selectedReportId = paramsMap.params.reportId
            const matchingIndex = reports.findIndex(report => report.id == selectedReportId)
            const resultingIndex = matchingIndex == -1 ? 0 : matchingIndex
            if (reports.length)
              this.onTabChanged(resultingIndex)
            return resultingIndex
          })
        )
        return onLoadIndex
      }),
      catchError(err => throwError(err)))
  }

  onTabChanged(tabNumber: number) {
    this.store.dispatch(AppActions.startLoading())
    const activeReport = this.reports[tabNumber]
    this.updateRouterParams(this.reports[tabNumber].id)
    this.backendService.getData(activeReport.dataTableName)
      .subscribe((resp: any[]) => {
        this.setReportFromData(resp, activeReport)
      })
  }

  setReportFromData(resp: any[], report: Report) {
    if (resp.length) {
      report.displayedColumns = Object.keys(resp[0])
      if (report.footer) {
        if (report.footer == 'project value') {
          const sum = resp.map(row => row[report.footer]).reduce((acc, cur) => acc += +cur, 0)
          this.footer = sum//new CurrencyPipe('en-US').transform(sum)
        }
        else {
          // Average Estimate Hours
          const sum = resp.map(row => {
            return row[report.footer]
              .split(":")
              .map(val => +val)
              .reduce((acc, cur, i) => acc += i == 0 ? cur * 60 : cur, 0)
          }).reduce((acc, cur) => acc += cur, 0)
          const min = Math.floor(sum / resp.length) % 60
          const hrs = Math.floor((sum / resp.length) / 60)
          this.footer = (hrs < 10 ? '0' + hrs : hrs) + ":" + (min < 10 ? '0' + min : min)
        }
      }
      report.dataSource = new MatTableDataSource(resp);
      report.dataSource.sort = this.sort
    }
    this.store.dispatch(AppActions.stopLoading())
  }

  onSortChanged() {
    this.sortCol = this.sort.active
  }

  onExport(report) {
    const csvData = convertJsonToCSV(report.dataSource.filteredData)
    const blob = URL.createObjectURL(new Blob([csvData], { type: 'text/csv' }))
    const fileName = report.id + " " + (new Date().toISOString()) + '.csv'
    saveAs(blob, fileName)
  }

  updateRouterParams(reportId) {
    window.history.replaceState({}, '', `/reports/${reportId}`);
  }

  applyFilter(event: Event, dataSource) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }

}
