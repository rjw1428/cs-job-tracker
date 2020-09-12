import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../../services/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { saveAs } from 'file-saver'
import { convertJsonToCSV, showSnackbar } from '../../shared/utility';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
// import { AppState } from '../root.reducers';
// import { AppActions } from '../shared/app.action-types';
import { CurrencyPipe } from '@angular/common';
// import { reportSelector, timeShorcutSelector } from '../shared/app.selectors';
import { Observable, throwError, of, noop, Subscription } from 'rxjs';
import { switchMap, first, map, catchError, tap } from 'rxjs/operators';
// import { TimeShortcut } from '../filter/filter.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppState } from 'src/models/appState';
import { ReportActions } from './reports.action-types';
import { activeIndexSelector, reportConfigSelector, reportSpecificTimeShortcutSelector, selectedReportConfigSelector } from './reports.selectors';
import { TimeShortcut } from 'src/models/timeShortcut';
import { ReportConfig } from 'src/models/reportConfig';
import { AppActions } from 'src/app/app.action-types';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit, OnDestroy {
  // displayedColumns: string[]
  // dataSource: any
  selectedTab$: Observable<number>
  timeShortcuts$: Observable<TimeShortcut[]>
  reports$: Observable<ReportConfig[]>
  // reports: Report[] = []
  sortCol: string
  footer: string
  // timeframe: { from: Date, to: Date }
  currentTab: number
  // selectedShortcut: string
  updateRouterSubscription: Subscription
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    private store: Store<AppState>,
  ) { }

  ngOnDestroy() {
    this.updateRouterSubscription.unsubscribe()
  }

  ngOnInit(): void {
    this.store.dispatch(ReportActions.initReports())
    this.timeShortcuts$ = this.store.select(reportSpecificTimeShortcutSelector)
    this.reports$ = this.store.select(reportConfigSelector)
    this.selectedTab$ = this.store.select(activeIndexSelector)


    // On Load, store the chart config ID
    this.route.paramMap.pipe(
      first(),
      map((paramsMap: Params) => paramsMap.params.reportId),
      tap(reportId => this.store.dispatch(ReportActions.setInitialReportId({ reportId })))
    ).subscribe(noop)

    // Update Router params as chart changes
    this.updateRouterSubscription = this.store.select(selectedReportConfigSelector)
      .pipe(tap(config => {
        if (config) this.updateRouterParams(config.id)
      })).subscribe(noop)
  }

  updateRouterParams(chartId) {
    window.history.replaceState({}, '', `/reports/${chartId}`);
  }

  onTabChanged(index: number) {
    this.store.dispatch(AppActions.startLoading())
    this.store.dispatch(ReportActions.setSelectedReportByIndex({ index }))
    this.currentTab = index
    // this.store.dispatch(AppActions.startLoading())
    // const activeReport = this.reports[tabNumber]
    // this.timeShortcuts$ = this.store.select(timeShorcutSelector)
    //   .pipe(
    //     first(),
    //     map(shortcuts => {
    //       return shortcuts.filter(shortcut => {
    //         return activeReport.excludedTimes && activeReport.excludedTimes.length
    //           ? !activeReport.excludedTimes.includes(shortcut.id)
    //           : true
    //       })
    //     }),
    //     tap((shortcuts: TimeShortcut[]) => {
    //       // Set default time
    //       if (!shortcuts.length || !init) return
    //       const defaultTime = shortcuts.find(sc => sc.id == activeReport.defaultTime ? activeReport.defaultTime : 'last_year')
    //       this.selectedShortcut = defaultTime
    //         ? activeReport.defaultTime ? activeReport.defaultTime : 'last_year'
    //         : shortcuts[0].id

    //       const selectedTime = shortcuts.find(sc => sc.id == this.selectedShortcut)
    //       this.timeframe = { from: selectedTime.start(new Date()), to: selectedTime.end(new Date()) }
    //     })
    //   )
    // this.timeShortcuts$.pipe(
    //   switchMap(shortcuts => {
    //     if (!shortcuts.length) return of(null)
    //     const start = new Date(this.timeframe.from.getFullYear(), this.timeframe.from.getMonth(), this.timeframe.from.getDate()).getTime() / 1000
    //     const end = new Date(this.timeframe.to.getFullYear(), this.timeframe.to.getMonth(), this.timeframe.to.getDate()).getTime() / 1000
    //     const timeClause = { start, end }
    //     this.currentTab = tabNumber
    //     return this.backendService.getReport(activeReport.storedProcedure, timeClause)
    //   })).subscribe(
    //     (resp: any[]) => {
    //       if (resp) {
    //         this.updateRouterParams(activeReport.id)
    //         this.setReportFromData(resp, activeReport)
    //       }
    //     },
    //     err => {
    //       console.log(err)
    //       showSnackbar(this.snackBar, err.error.error)
    //       this.store.dispatch(AppActions.stopLoading())
    //     },
    //     () => {
    //       this.store.dispatch(AppActions.stopLoading())
    //     })
  }

  setReportFromData(resp: any[], report: ReportConfig) {
    // if (resp.length) {
    //   report.displayedColumns = Object.keys(resp[0])
    //   if (report.footer) {
    //     if (report.footer == 'project value') {
    //       const sum = resp.map(row => row[report.footer]).reduce((acc, cur) => acc += +cur, 0)
    //       this.footer = new CurrencyPipe('en-US').transform(sum)
    //     }
    //     else {
    //       // Average Estimate Hours
    //       const sum = resp.map(row => {
    //         return row[report.footer]
    //           .split(":")
    //           .map(val => +val)
    //           .reduce((acc, cur, i) => acc += i == 0 ? cur * 60 : cur, 0)
    //       }).reduce((acc, cur) => acc += cur, 0)
    //       const min = Math.floor(sum / resp.length) % 60
    //       const hrs = Math.floor((sum / resp.length) / 60)
    //       this.footer = (hrs < 10 ? '0' + hrs : hrs) + ":" + (min < 10 ? '0' + min : min)
    //     }
    //   }
    //   report.dataSource = new MatTableDataSource(resp);
    //   report.dataSource.sort = this.sort
    // }
    // else {
    //   report.dataSource = new MatTableDataSource([]);
    //   this.footer = null
    // }
    // this.store.dispatch(AppActions.stopLoading())
  }

  onSortChanged() {
    // this.sortCol = this.sort.active
  }

  onExport(report) {
    const csvData = convertJsonToCSV(report.dataSource.filteredData)
    const blob = URL.createObjectURL(new Blob([csvData], { type: 'text/csv' }))
    const fileName = report.id + " " + (new Date().toISOString()) + '.csv'
    saveAs(blob, fileName)
  }

  onDateRangeSet(dateRange: { from: Date, to: Date }) {
    // this.timeframe = dateRange
    // this.onTabChanged(this.currentTab, false)
  }


  applyFilter(event: Event, dataSource) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }

  onRefresh() {
    this.backendService.refreshBackend('reports')
  }

}
