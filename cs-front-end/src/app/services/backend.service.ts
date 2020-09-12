import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { Subject, throwError, noop } from 'rxjs';
import { Estimator } from 'src/models/estimator';
import { AppState } from 'src/models/appState';
import { select, Store } from '@ngrx/store';
import { DashboardActions } from '../sidebar/dashboard/dashboard.action-types';
import { first, map, tap } from 'rxjs/operators';
import { Job } from 'src/models/job';
import { AppActions } from '../app.action-types';
import { ChartsActions } from '../sidebar/charts/charts.action-types';
import { ReportActions } from '../sidebar/reports/reports.action-types';
import { chartDataForFetchSelector } from '../sidebar/charts/charts.selectors';
import { reportDataForFetchSelector } from '../sidebar/reports/reports.selectors';
import { saveAs } from 'file-saver'
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  socket: SocketIOClient.Socket;
  constructor(
    private http: HttpClient,
    private store: Store<AppState>
  ) {
    this.socket = io(environment.apiUrl)
    this.socket.on('getEstimators', (estimators) => {
      this.store.dispatch(DashboardActions.storeEstimators({ estimators }))
    })

    this.socket.on('getContractors', (contractors) => {
      this.store.dispatch(DashboardActions.storeContractors({ contractors }))
    })

    this.socket.on('getProjects', (projects) => {
      this.store.dispatch(DashboardActions.storeProjects({ projects }))
    })

    this.socket.on('getInvitesForSingleColumn', ({ items, columnId }) => {
      this.store.dispatch(DashboardActions.updateColumnInvites({ items, columnId }))
    })

    this.socket.on('getBoxOptions', (boxOptions) => {
      this.store.dispatch(DashboardActions.storeBoxOptions({ boxOptions }))
    })

    this.socket.on('getEstimateTypes', (estimateTypes) => {
      this.store.dispatch(DashboardActions.storeEstimateTypes({ estimateTypes }))
    })

    this.socket.on('getColumns', (columns) => {
      this.store.dispatch(DashboardActions.storeDashboardColumns({ columns }))
      this.store.dispatch(AppActions.stopLoading())
    })

    this.socket.on('getFiles', ({ job, jobFiles }) => {
      this.store.dispatch(DashboardActions.storeViewFilesJob({ job, jobFiles }))
    })

    this.socket.on('getSingleProposal', ({ job, estimates }) => {
      this.store.dispatch(DashboardActions.storeSelectedProposal({ job, estimates }))
    })

    this.socket.on('getHistory', ({ job, transactions }) => {
      this.store.dispatch(DashboardActions.storeSelectedHistory({ job, transactions }))
    })

    this.socket.on('getProposalHistory', ({ job, proposals }) => {
      this.store.dispatch(DashboardActions.storeProposalHistory({ job, proposals }))
    })

    this.socket.on('getTimeShortcuts', timeShortcuts => {
      this.store.dispatch(ChartsActions.storeTimeShortcuts({ timeShortcuts }))
      this.store.dispatch(ReportActions.storeTimeShortcuts({ timeShortcuts }))
    })

    //  ------------------------CHARTS---------------------------

    this.socket.on('getChartConfigs', chartConfigs => {
      this.store.dispatch(ChartsActions.storeChartConfigs({ chartConfigs }))
    })

    this.socket.on('updateChart', ({ config, data }) => {
      this.store.dispatch(ChartsActions.addDataToConfig({ config, data }))
    })

    // ------------------------REPORTS---------------------------
    this.socket.on('getReportConfigs', reportConfigs => {
      console.log(reportConfigs)
      this.store.dispatch(ReportActions.storeReportConfigs({ reportConfigs }))
    })

    this.socket.on('updateReport', ({ config, data }) => {
      console.log(data)
      this.store.dispatch(ReportActions.addDataToConfig({ config, data }))
    })
  }

  sendEmail(message: string) {
    return this.http.post(`${environment.apiUrl}/email`, { message })
  }

  initDashboard() {
    this.socket.emit('dashboard')
  }

  initBidForm() {
    this.socket.emit('bidFormInit')
  }

  initEstimateForm() {
    this.socket.emit('estimateFormInit')
  }

  initViewProposal(proposalId, job) {
    this.socket.emit('proposalFormInit', { proposalId, job })
  }

  initViewProposalHistory(job) {
    this.socket.emit('proposalHistoryFormInit', job)
  }

  initViewJobHistory(job: Job) {
    this.socket.emit('jobHistoryFormInit', job)
  }

  initCharts() {
    this.socket.emit('charts')
  }

  initReports() {
    this.socket.emit('reports')
  }

  initViewFileForm(job: Job) {
    this.socket.emit('viewFilesInit', job)
    this.socket.emit('updateColumn', job)
  }

  saveData(socketEvent: string, data: any) {
    console.log("SAVING")
    let subj = new Subject<any[]>()
    this.socket.emit(socketEvent, data, (resp) => {
      subj.next(resp)
    })
    return subj.asObservable().pipe(first())
  }


  deleteProposal(proposalId, job: Job) {
    this.socket.emit('removeProposal', ({ proposalId, job }))
  }


  sendFile(jobId, file, fileIndex, displayId) {
    const formData: any = new FormData()
    formData.append("document", file, file.fileName);
    const url = `${environment.apiUrl}/upload/${jobId}?folder=${displayId}`
    const req = new HttpRequest('POST', url, formData, { reportProgress: true });
    return this.http.request(req).pipe(map(resp => ({ response: resp, index: fileIndex })))
  }

  getFile(jobId, fileName, displayId) {
    console.log(fileName)
    this.http.get(`${environment.apiUrl}/download/${jobId}/${fileName}?folder=${displayId}`, { responseType: 'blob' })
      .subscribe((resp: any) => {
        saveAs(resp, decodeURIComponent(fileName))
      })
  }

  fetchChartData() {
    this.store.select(chartDataForFetchSelector).pipe(
      first(),
      map(({ config, start, end }) => {
        console.log(start, end)
        this.socket.emit('fetchChartData', config, start, end)
      })
    ).subscribe(noop)
  }

  fetchReportData() {
    this.store.select(reportDataForFetchSelector).pipe(
      first(),
      map(({ config, start, end }) => {
        console.log(start, end)
        this.socket.emit('fetchReportData', config, start, end)
      })
    ).subscribe(noop)
  }


  refreshBackend(triggerEvent) {
    this.socket.emit('refreshBackend', triggerEvent, (event) => {
      this.socket.emit(event)
    })
  }
}
