import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import { Subject, throwError } from 'rxjs';
import { Estimator } from 'src/models/estimator';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { DashboardActions } from '../sidebar/dashboard/dashboard.action-types';
import { first } from 'rxjs/operators';

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

  saveData(socketEvent: string, data: any) {
    console.log("SAVING")
    let subj = new Subject<Estimator[]>()
    this.socket.emit(socketEvent, data, (resp) => {
      subj.next(resp)
    })
    return subj.asObservable().pipe(first())
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
