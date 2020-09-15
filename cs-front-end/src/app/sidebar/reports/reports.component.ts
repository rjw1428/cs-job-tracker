import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../../services/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { saveAs } from 'file-saver'
import { convertJsonToCSV, convertRawShortcut, formatDate, showSnackbar } from '../../shared/utility';
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
import { activeIndexSelector, reportConfigSelector, reportSpecificTimeShortcutSelector, selectedReportConfigSelector, selectedReportSelector } from './reports.selectors';
import { TimeShortcut } from 'src/models/timeShortcut';
import { ReportConfig } from 'src/models/reportConfig';
import { AppActions } from 'src/app/app.action-types';
import * as xlsx from 'sheetjs-style'
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, OnDestroy {
  initialTab$: Observable<number>
  timeShortcuts$: Observable<TimeShortcut[]>
  reports: ReportConfig[]
  footer: string
  currentTab: number
  dataSubscription: Subscription
  sortCol: string
  dataSource: MatTableDataSource<any>
  timeframe: { start: number, end: number }
  selectedShortcut: string
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  refreshInterval: any;
  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe()
    clearInterval(this.refreshInterval)
  }

  ngOnInit(): void {
    this.initialTab$ = this.store.pipe(
      first(),
      map(state => state.app.reportConfigs),
      switchMap(reports => {
        this.reports = JSON.parse(JSON.stringify(reports))
        const onLoadIndex = this.route.paramMap.pipe(
          first(),
          map((paramsMap: Params) => {
            const selectedReportId = paramsMap.params.reportId
            const matchingIndex = reports.findIndex(report => report.id == selectedReportId)
            const resultingIndex = matchingIndex == -1 ? 0 : matchingIndex
            if (reports.length)
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
    const activeReport = this.reports[tabNumber]
    this.timeShortcuts$ = this.store.pipe(
      first(),
      map(state => state.app.timeShortcuts.map(sc => convertRawShortcut(sc))),
      map(shortcuts => {
        return shortcuts.filter(shortcut => {
          return activeReport.excludedTimes && activeReport.excludedTimes.length
            ? !activeReport.excludedTimes.includes(shortcut.id)
            : true
        })
      }),
      tap((shortcuts: TimeShortcut[]) => {
        // Set default time
        if (!shortcuts.length || !init) return
        const defaultTime = shortcuts.find(sc => sc.id == activeReport.defaultTime ? activeReport.defaultTime : 'last_year')
        this.selectedShortcut = defaultTime
          ? activeReport.defaultTime ? activeReport.defaultTime : 'last_year'
          : shortcuts[0].id

        const selectedTime = shortcuts.find(sc => sc.id == this.selectedShortcut)
        this.timeframe = {
          start: Math.floor(selectedTime.start(new Date()).getTime() / 1000),
          end: Math.floor(selectedTime.end(new Date()).getTime() / 1000)
        }
      })
    )
    this.dataSubscription = this.timeShortcuts$.pipe(
      switchMap(shortcuts => {
        if (!shortcuts.length) return of(null)
        const start = this.timeframe.start
        const end = this.timeframe.end
        const timeClause = { start, end }
        this.currentTab = tabNumber
        console.log(timeClause)
        return this.backendService.fetchData(activeReport.storedProcedure, timeClause)
      })).subscribe(
        (resp: any[]) => {
          if (resp) {
            this.updateRouterParams(activeReport.id)
            this.setReportFromData(resp, activeReport)
          }
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error.sqlMessage)
          this.store.dispatch(AppActions.stopLoading())
        },
        () => {
          this.store.dispatch(AppActions.stopLoading())
        })
  }



  setReportFromData(resp: any[], report: ReportConfig) {
    if (resp.length) {
      report.displayedColumns = Object.keys(resp[0]).slice(0, -1)
      if (report.footer) {
        if (report.footer == 'project value') {
          const sum = resp.map(row => row[report.footer]).reduce((acc, cur) => acc += +cur, 0)
          this.footer = new CurrencyPipe('en-US').transform(sum)
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
    else {
      report.dataSource = new MatTableDataSource([]);
      this.footer = null
    }
    this.store.dispatch(AppActions.stopLoading())
  }

  onSortChanged() {
    this.sortCol = this.sort.active
  }

  onExport(report: ReportConfig) {
    const dataRows = report.dataSource.filteredData.map(d => {
      return Object.keys(d)
        .filter(key => key != 'color')
        .map(key => ({ [key]: d[key] }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {})
    })

    if (!dataRows.length) return showSnackbar(this.snackBar, "No Data to export")

    const dataRowsAppended = report.footer
      ? dataRows.concat({ [report.footer]: this.footer })
      : dataRows

    const fileName = report.id + " " + formatDate(new Date()) + '.xlsx'
    const wb = xlsx.utils.book_new();
    let workSheet = xlsx.utils.json_to_sheet(dataRowsAppended);

    // Set col width
    workSheet['!cols'] = Object.keys(dataRows[0]).map((colKey, i) => ({ width: i == 1 ? 40 : 20 }))

    // Set header bold
    Object.keys(dataRows[0]).map((colKey, i) => {
      const letter = String.fromCharCode(65 + i)
      workSheet[letter + 1] = { ...workSheet[letter + 1], s: { font: { bold: true } } }
    })


    xlsx.utils.book_append_sheet(wb, workSheet, report.name);
    xlsx.writeFile(wb, fileName, { cellStyles: true });
  }

  onDateRangeSet(dateRange: { from: Date, to: Date }) {
    this.timeframe = { start: Math.floor(dateRange.from.getTime() / 1000), end: Math.floor(dateRange.to.getTime() / 1000) }
    this.onTabChanged(this.currentTab, false)
  }

  applyFilter(event: Event, dataSource) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }

  updateRouterParams(reportId) {
    window.history.replaceState({}, '', `/reports/${reportId}`);
  }

  onRefresh() {
    this.backendService.refreshBackend('reports')
  }

}
