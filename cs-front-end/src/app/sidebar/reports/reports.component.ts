import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../../services/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { convertRawShortcut, formatDate, formatLengthOfTime, isValidDate, showSnackbar } from '../../shared/utility';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { CurrencyPipe } from '@angular/common';
import { Observable, throwError, of, noop, Subscription } from 'rxjs';
import { switchMap, first, map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppState } from 'src/models/appState';
import { TimeShortcut } from 'src/models/timeShortcut';
import { ReportConfig } from 'src/models/reportConfig';
import { AppActions } from 'src/app/app.action-types';
import { ElectronService } from 'ngx-electron';
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
  footer: string | any
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
    private electronService: ElectronService,
    private ngZone: NgZone,
  ) { }

  ngOnDestroy() {
    if (this.dataSubscription)
      this.dataSubscription.unsubscribe()
    clearInterval(this.refreshInterval)
  }

  ngOnInit(): void {
    this.store.dispatch(AppActions.initApp())
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
      this.onTabChanged(this.currentTab, false)
    }, 60 * 1000)

    this.electronService.ipcRenderer.on('export_success', (event, fileName) =>{
      this.ngZone.run(()=>{
        showSnackbar(this.snackBar, `${fileName} Saved!`)
      })
    })
  }

  onTabChanged(tabNumber: number, init: boolean) {
    this.store.dispatch(AppActions.startLoading())
    const activeReport = this.reports[tabNumber]
    this.timeShortcuts$ = this.store.pipe(
      first(),
      map(state => state.app.timeShortcuts.map(sc => convertRawShortcut(sc))),
      map(shortcuts => {
        return shortcuts.filter(shortcut => {
          return activeReport && activeReport.excludedTimes && activeReport.excludedTimes.length
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
        const start = selectedTime.start(new Date())
          ? Math.floor(selectedTime.start(new Date()).getTime() / 1000)
          : null
        const end = selectedTime.end(new Date())
          ? Math.floor(selectedTime.end(new Date()).getTime() / 1000)
          : null
        this.timeframe = { start, end }
      })
    )
    this.dataSubscription = this.timeShortcuts$.pipe(
      switchMap(shortcuts => {
        if (!shortcuts.length) return of(null)
        const timeClause = { start: this.timeframe.start, end: this.timeframe.end }
        this.currentTab = tabNumber
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
          showSnackbar(this.snackBar, err.error.error ? err.error.error.sqlMessage : err.error.message)
          this.store.dispatch(AppActions.stopLoading())
        },
        () => {
          this.store.dispatch(AppActions.stopLoading())
        })
  }



  setReportFromData(resp: any[], report: ReportConfig) {
    if (resp.length) {

      // FORMATE DATES
      resp = resp.map(row => {
        return Object.keys(row).map(field => {
          if (field == "Invite Time" || field == "Hold Time" || field == "Turnaround Time" || field == "Estimating Time")
            return { [field + " (Days:Hours:Min)"]: formatLengthOfTime(row[field]) }
          return { [field]: row[field] }
        }).reduce((acc, cur) => ({ ...acc, ...cur }), {})
      })

      report.displayedColumns = report.clickable
        ? ["open"].concat(Object.keys(resp[0]).slice(0, -2))
        : Object.keys(resp[0]).slice(0, -1)

      console.log(report.displayedColumns)

      // SET FOOTER (SUM VALUES BEFORE THEY ARE FORMATTED)
      if (report.footer) {
        if (report.footer == 'project value') {
          const sum = resp.map(row => row[report.footer]).reduce((acc, cur) => acc += +cur, 0)
          this.footer = new CurrencyPipe('en-US').transform(sum)
        }
        else if (report.footer == 'all') {
          this.footer = report.displayedColumns.map((col, i) => {
            if (i == 0) return { [col]: "TOTALS" }
            const sum = resp.map(row => row[col]).reduce((acc, cur) => acc += +cur, 0)
            return (col.toLowerCase().includes('amount') || col.toLowerCase().includes('paid'))
              ? { [col]: new CurrencyPipe('en-US').transform(sum) }
              : { [col]: sum }
          }).reduce((acc, cur) => ({ ...acc, ...cur }), {})
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

      // FORMAT CELLS WITH CURRENCY
      resp = resp.map(row => {
        return Object.keys(row).map(field => {
          if (field.toLowerCase().includes('amount') || field.toLowerCase().includes('paid') || field.toLowerCase() == 'project value')
            return { [field]: new CurrencyPipe('en-US').transform(row[field]) }
          return { [field]: row[field] }
        }).reduce((acc, cur) => ({ ...acc, ...cur }), {})
      })


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
        .filter(key => key != 'color' && key != 'epoch')
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
    workSheet['!cols'] = Object.keys(dataRows[0]).map((colKey, i) => {
      const isLarge = ['project', 'general contractor'].includes(colKey.toLowerCase())
      return { width: isLarge ? 40 : 20, }
    })

    // Set header bold
    Object.keys(dataRows[0]).map((colKey, i) => {
      const letter = String.fromCharCode(65 + i)
      workSheet[letter + 1] = { ...workSheet[letter + 1], s: { font: { bold: true } } }
    })

    //Set each cells format
    const skipList = ['!cols', '!ref']
    workSheet = Object.keys(workSheet)
      .filter(key => workSheet[key].v !== null)
      .map(key => {
        if (skipList.includes(key)) return { [key]: workSheet[key] }
        const value = workSheet[key].v
        // Set format (number must be done before date format)
        if (!value)
          return { [key]: { ...workSheet[key], t: "n" } }
        const isNumber = Number.isNaN(+value)
        const isCurrency = !!value.indexOf && value.indexOf('$') == 0
        if (isNumber && isCurrency)
          return { [key]: { ...workSheet[key], v: Number(value.replace(/[^0-9.-]+/g, "")), t: "n", z: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)' } }
        if (!Number.isNaN(+value))
          return { [key]: { ...workSheet[key], t: "n" } }
        if (isValidDate(value)) {
          return { [key]: { ...workSheet[key], t: "d" } }
        }
        return { [key]: { ...workSheet[key] } }
      })
      .reduce((a, b) => ({ ...a, ...b }), {})

    xlsx.utils.book_append_sheet(wb, workSheet, report.name);
    const data =  xlsx.write(wb, { type: 'buffer', bookType: 'xlsx'});
    this.electronService.ipcRenderer.send('report_export', {data, fileName})
  }

  onDateRangeSet(dateRange: { from: Date, to: Date }) {
    this.timeframe = {
      start: dateRange.from
        ? Math.floor(dateRange.from.getTime() / 1000)
        : null,
      end: dateRange.to
        ? Math.floor(dateRange.to.getTime() / 1000)
        : null
    }
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

  // onClick(elemet) {
  //   console.log(elemet)
  // }

}
