import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { Subject, throwError, noop } from 'rxjs';
import { Estimator } from 'src/models/estimator';
import { AppState } from 'src/models/appState';
import { select, Store } from '@ngrx/store';
import { DashboardActions } from '../sidebar/dashboard/dashboard.action-types';
import { first, map, shareReplay, tap } from 'rxjs/operators';
import { Job } from 'src/models/job';
import { AppActions } from '../app.action-types';
import { ChartsActions } from '../sidebar/charts/charts.action-types';
import { ReportActions } from '../sidebar/reports/reports.action-types';
import { saveAs } from 'file-saver'
import { ReportConfig } from 'src/models/reportConfig';
import { ChartConfig } from 'src/models/chartConfig';
import { RawTimeShortcut } from 'src/models/rawTimeShortcut';
import { version } from '../../../package.json';
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  socket: SocketIOClient.Socket;
  apiUrl: string
  version: string
  constructor(
    private http: HttpClient,
    private store: Store<AppState>
  ) {
  }

  setupBackend() {
    return this.http.get(environment.assetPath + 'config.json')
      .toPromise()
      .then((data: { endpoint: {} }) => {
        console.log(data)
        this.apiUrl = data.endpoint[environment.env]
        this.version = version

        this.socket = io(this.apiUrl)
        this.socket.on('getEstimators', (estimators) => {
          this.store.dispatch(DashboardActions.storeEstimators({ estimators }))
        })

        this.socket.on('getContractors', (contractors) => {
          this.store.dispatch(DashboardActions.storeContractors({ contractors }))
        })

        this.socket.on('getProjects', (projects) => {
          this.store.dispatch(DashboardActions.storeProjects({ projects }))
        })

        this.socket.on('getInvites', (invites) => {
          this.store.dispatch(DashboardActions.storeInvites({ invites }))
        })

        this.socket.on('getUpdatedJob', (job) => {
          console.log(job)
          this.store.dispatch(DashboardActions.updateJob({ job }))
        })

        this.socket.on('getRemovedJob', (jobId) => {
          this.store.dispatch(DashboardActions.removeJob({ jobId }))
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

        this.socket.on('getFileTypes', (fileTypeOptions) => {
          this.store.dispatch(DashboardActions.storeFileTypeOptions({ fileTypeOptions }))
        })

        this.socket.on('getSingleProposal', ({ job, proposal }) => {
          this.store.dispatch(DashboardActions.storeSelectedProposal({ job, proposal }))
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
      })
  }

  sendEmail(message: string) {
    return this.http.post(`${this.apiUrl}/email`, { message })
  }

  initDashboard() {
    this.socket.emit('dashboard')
  }

  initSearch() {
    this.socket.emit('searchInit')
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

  initAddFileForm() {
    this.socket.emit('addFileFormInit')
  }

  initApp() {
    let subj = new Subject<{ chartConfigs: ChartConfig[], rawShortcuts: RawTimeShortcut[], reportConfigs: ReportConfig[] }>()
    this.socket.emit('init', (resp) => {
      subj.next(resp)
    })
    return subj.asObservable().pipe(first())
  }

  switchBoxes(projectId, newBox) {
    this.socket.emit('changeBox', ({ projectId, newBox }))
  }

  getJob(jobId: number) {
    let subj = new Subject<Job>()
    this.socket.emit('getJob', jobId, (resp) => {
      subj.next(resp)
    })
    return subj.asObservable().pipe(first())
  }

  initViewFileForm(job: Job) {
    this.socket.emit('viewFilesInit', job)
    this.socket.emit('updateColumn', job)
  }

  getMatchingProjects(projectId) {
    return new Promise<Job[]>((resolve, reject) => {
      this.socket.emit('getMatchingProjects', projectId, (resp) => {
        resolve(resp)
      })
    })
  }

  getSearch(term) {
    return new Promise((resolve, reject) => {
      this.socket.emit('seach', term, (resp) => {
        resolve(resp)
      })
    })
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

  deleteEstimate(mapId: number, job: Job) {
    this.socket.emit('removeEstimate', 'map_estimates_to_jobs', { mapId }, (resp) => {
      if (resp) {
        this.socket.emit('proposalHistoryFormInit', job)
        this.socket.emit('getJob', job.jobId, (job => {
          this.store.dispatch(DashboardActions.updateJob({ job }))
        }))
      }
    })

  }


  sendFile({ jobId, file, fileIndex, folder, subFolder }) {
    const formData: any = new FormData()
    formData.append("document", file, file.fileName);
    const url = `${this.apiUrl}/upload/${jobId}?folder=${folder}&subfolder=${subFolder}`
    const req = new HttpRequest('POST', url, formData, { reportProgress: true });
    return this.http.request(req).pipe(map(resp => ({ response: resp, index: fileIndex })))
  }

  getFile({ jobId, fileName, folder, subFolder }) {
    this.http.get(`${this.apiUrl}/download/${jobId}/${fileName}?folder=${folder}&subfolder=${subFolder}`, { responseType: 'blob' })
      .subscribe((resp: any) => {
        saveAs(resp, decodeURIComponent(fileName))
      })
  }

  fetchData(storedProcedure: string, params?: {}) {
    const paramString = (params) ? this.convertObjToParma(params) : ""
    return this.http.get<any[]>(`${this.apiUrl}/api/data/${storedProcedure}${paramString}`).pipe(
      shareReplay()
    )
  }

  convertObjToParma(obj: {}) {
    return "?" + Object.keys(obj).map(key => {
      return `${key}=${encodeURIComponent(
        typeof obj[key] == 'object'
          ? obj[key] ? obj[key].join("|") : null
          : obj[key]
      )}`
    }).join("&")
  }


  refreshBackend(triggerEvent) {
    this.socket.emit('refreshBackend', triggerEvent, (event) => {
      this.socket.emit(event)
    })
  }
}
