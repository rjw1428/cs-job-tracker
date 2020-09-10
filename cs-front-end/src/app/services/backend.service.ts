import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { Subject, throwError } from 'rxjs';
import { Estimator } from 'src/models/estimator';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { DashboardActions } from '../sidebar/dashboard/dashboard.action-types';
import { first, map } from 'rxjs/operators';
import { Job } from 'src/models/job';
import { AppActions } from '../app.action-types';

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

  initViewFileForm(job: Job) {
    this.socket.emit('viewFilesInit', job)
    this.socket.emit('updateColumn', job)
  }

  saveData(socketEvent: string, data: any) {
    console.log("SAVING")
    let subj = new Subject<Estimator[]>()
    this.socket.emit(socketEvent, data, (resp) => {
      subj.next(resp)
    })
    return subj.asObservable().pipe(first())
  }


  sendFile(jobId, file, fileIndex, displayId) {
    const formData: any = new FormData()
    formData.append("document", file, file.fileName);
    const url = `${environment.apiUrl}/upload/${jobId}?folder=${displayId}`
    const req = new HttpRequest('POST', url, formData, { reportProgress: true });
    return this.http.request(req).pipe(map(resp => ({ response: resp, index: fileIndex })))
  }


  // addContractor() {
  //   this.socket.emit('addContractor', (contractors) => {

  //   })
  // }

  // addProject() {
  //   this.socket.emit('addProject', (projects) => {

  //   })
  // }



}
