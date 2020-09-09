import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { DashboardActions } from './dashboard.action-types';
import { BackendService } from 'src/app/services/backend.service';
import { AppActions } from 'src/app/app.action-types';
import { Observable, iif, of } from 'rxjs';
import { Estimator } from 'src/models/estimator';
import { map, mergeMap, finalize, catchError, first } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddContractorComponent } from './add-contractor/add-contractor.component';
import { showSnackbar } from 'src/app/shared/utility';
import { Contractor } from 'src/models/contractor';
import { Project } from 'src/models/project';
import { estimatorsSelector, contractorsSelector, projectsSelector } from './dashboard.selectors';
import { AddProjectComponent } from './add-project/add-project.component';
import { BidInvite } from 'src/models/bidInvite';
import { AddInviteComponent } from './add-invite/add-invite.component';
import { AddEstimateComponent } from './add-estimate/add-estimate.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private backendService: BackendService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.initDashboard())
    this.store.dispatch(AppActions.startLoading())

    this.backendService.initDashboard()

    setTimeout(() => {
      this.store.dispatch(AppActions.stopLoading())
    }, 1000)
  }

  onCreateContractor() {
    const dialogRef = this.dialog.open(AddContractorComponent, {
      width: '500px',
    }).afterClosed().pipe(
      first(),
      mergeMap(formResp => {
        if (!formResp) return of(null)
        return this.backendService.saveData('addContractor', formResp)
      }),
    ).subscribe(resp => {
      if (resp) showSnackbar(this.snackBar, "General Contractor Saved")
      // this.dialogRef.close({ message: "General Contractor Saved", value: { ...form, contractorId: resp['insertId'] } });
    },
      err => {
        console.log(err)
        showSnackbar(this.snackBar, err)
        // this.error = err.error.error.sqlMessage
      },
      () => console.log("COMPLETE")
    )
  }

  onCreateProject() {
    const dialogRef = this.dialog.open(AddProjectComponent, {
      width: '500px',
    }).afterClosed().pipe(
      first(),
      mergeMap(formResp => {
        if (!formResp) return of(null)
        return this.backendService.saveData('addProject', formResp)
      }),
    ).subscribe(resp => {
      if (resp && resp.error) return showSnackbar(this.snackBar, "ERROR:" + resp.error.sqlMessage)
      if (resp) showSnackbar(this.snackBar, "Project Saved")
    })
  }

  onCreateBid() {
    const dialogRef = this.dialog.open(AddInviteComponent, {
      width: '500px',
    }).afterClosed().pipe(
      first(),
      mergeMap(formResp => {
        if (!formResp) return of(null)
        return this.backendService.saveData('addInvite', formResp)
      }),
    ).subscribe(resp => {
      if (resp && resp.error) return showSnackbar(this.snackBar, "ERROR:" + resp.error.sqlMessage)
      if (resp) showSnackbar(this.snackBar, "Bid Invite Saved")
    })
  }

  onCreateEstimate() {
    const dialogRef = this.dialog.open(AddEstimateComponent, {
      width: '700px'
    }).afterClosed().pipe(
      first(),
      mergeMap(formResp => {
        console.log(formResp)
        if (!formResp) return of(null)
        return this.backendService.saveData('addEstimate', formResp)
      })
    ).subscribe(resp => {
      console.log(resp)
      if (resp && resp.error) return showSnackbar(this.snackBar, "ERROR:" + resp.error.sqlMessage)
      if (resp) showSnackbar(this.snackBar, "Estimate Saved")
    })
  }
}