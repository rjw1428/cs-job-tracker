import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AppState } from 'src/models/appState';
import { Store, select } from '@ngrx/store';
import { DashboardActions } from './dashboard.action-types';
import { BackendService } from 'src/app/services/backend.service';
import { AppActions } from 'src/app/app.action-types';
import { Observable, iif, of, throwError, combineLatest } from 'rxjs';
import { Estimator } from 'src/models/estimator';
import { map, mergeMap, finalize, catchError, first, switchMap, tap, debounceTime } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddContractorComponent } from './add-contractor/add-contractor.component';
import { showSnackbar } from 'src/app/shared/utility';
import { AddProjectComponent } from './add-project/add-project.component';
import { AddInviteComponent } from './add-invite/add-invite.component';
import { AddEstimateComponent } from './add-estimate/add-estimate.component';
import { loadingSelector } from 'src/app/app.selectors';
import { EventService } from 'src/app/services/event.service';
import { ConfirmationSnackbarComponent } from 'src/app/popups/confirmation-snackbar/confirmation-snackbar.component';
import { AssignBidFormComponent } from './assign-bid-form/assign-bid-form.component';
import { AwardTimelineFormComponent } from './award-timeline-form/award-timeline-form.component';
import { FormControl } from '@angular/forms';
import { Job } from 'src/models/job';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  isLoading$: Observable<boolean>
  filterFormControl: FormControl

  isToProposalConfirmationOpen: boolean = false
  isToAwardTimelineOpen: boolean = false
  isToEstimatingAssignmentOpen: boolean = false
  constructor(
    private store: Store<AppState>,
    private backendService: BackendService,
    private eventService: EventService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.filterFormControl = new FormControl('')
    this.store.dispatch(DashboardActions.initDashboard())
    this.store.dispatch(AppActions.startLoading())
    this.isLoading$ = this.store.select(loadingSelector)
    this.backendService.initDashboard()

    this.filterFormControl.valueChanges.pipe(
      debounceTime(500),
    ).subscribe(value => {
      this.store.dispatch(DashboardActions.applyFilter({ value }))
    })

    this.eventService.confirmProposal.pipe(
      tap(() => console.log("CONFIRMATION EVENT")),
      switchMap(action => {
        // If it is dropped back on the same column, do nothing
        if (action.selectedJob.currentDashboardColumn == 'proposal' || this.isToProposalConfirmationOpen) return of({ action, skipProposal: true })

        // If there are estimates, make move
        if (action.selectedJob.estimateCount) return of({ action, skipProposal: false })

        // If no estimates are attached, warn user
        return this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
          data: { message: "There are no estimates currently attached to this job. Are you sure you want to move to Proposal Sent?", action: "Move" }
        }).afterDismissed().pipe(first(), map(result => ({ action, skipProposal: !result.dismissedByAction })))
      }),
      switchMap(({ action, skipProposal }) => {
        if (skipProposal) return of({ action, propId: null })
        return this.backendService.saveData('snapshotProposal', action.selectedJob)
          .pipe(first(), map(resp => ({ action, propId: resp })))
      }),
      catchError(err => throwError(err))
    ).subscribe(({ action, propId }) => {
      this.isToProposalConfirmationOpen = false
      if (propId)
        this.store.dispatch(DashboardActions.jobMoved({
          ...action,
          selectedJob: {
            ...action.selectedJob,
            historyOnlyNotes: `Moved to Proposal`,
            proposalId: propId,
            assignedTo: 0
          }
        }))
    },
      err => console.log(err)
    )

    this.eventService.triggerTimelineForm.pipe(
      switchMap(action => {
        if (action.selectedJob.currentDashboardColumn == 'awarded' || this.isToAwardTimelineOpen) return of(null)
        console.log("TIMELINE EVENT")
        this.isToAwardTimelineOpen = true
        return this.dialog.open(AwardTimelineFormComponent, {
          width: '500px',
          data: action.selectedJob
        }).afterClosed().pipe(
          first(),
          map(resp => {
            return resp
              ? { ...action, selectedJob: resp }
              : null
          }))
      })
    ).subscribe(action => {
      if (action)
        this.store.dispatch(DashboardActions.jobMoved({
          ...action,
          selectedJob: {
            ...action.selectedJob,
            historyOnlyNotes: `Moved to Awarded`
          }
        }))
      this.isToAwardTimelineOpen = false
    }
    )

    this.eventService.triggerAssignmentFrom.pipe(
      tap(() => console.log("ASSIGNMENT EVENT")),
      switchMap(action => {
        if (action.selectedJob.currentDashboardColumn == 'estimating' || this.isToEstimatingAssignmentOpen) return of(null)
        this.isToEstimatingAssignmentOpen = true
        return this.dialog.open(AssignBidFormComponent, {
          width: '500px',
          data: action.selectedJob
        }).afterClosed().pipe(
          first(),
          map(resp => {
            return resp
              ? { ...action, ...resp }
              : null
          }))
      })
    ).subscribe(action => {
      if (action)
        this.store.dispatch(DashboardActions.jobMoved({
          ...action,
          selectedJob: {
            ...action.selectedJob,
            historyOnlyNotes: `Moved to Estimating; Assigned to ${action.name}`
          }
        }))
      this.isToEstimatingAssignmentOpen = false
    })
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
      })
    ).subscribe(job => {
      if (job && job.error) return showSnackbar(this.snackBar, "ERROR:" + job.error.sqlMessage)
      if (job) showSnackbar(this.snackBar, "Bid Invite Saved")
    })
  }

  onCreateEstimate() {
    const dialogRef = this.dialog.open(AddEstimateComponent, {
      width: '700px'
    }).afterClosed().pipe(
      first(),
      mergeMap(formResp => {
        if (!formResp) return of(null)
        return combineLatest(formResp['estimates'].map(estimate => ({ estimate, jobs: formResp.jobs })).map(estimateObj => {
          return this.backendService.saveData('addEstimate', estimateObj)
        }))
      })
    ).subscribe(resp => {
      if (resp && resp.error) return showSnackbar(this.snackBar, "ERROR:" + resp.error.sqlMessage)
      if (resp) showSnackbar(this.snackBar, "Estimate Saved")
    })
  }

  onRemoveFilter() {
    this.filterFormControl.setValue('')
    this.store.dispatch(DashboardActions.applyFilter({ value: '' }))
  }

  onRefresh() {
    this.backendService.refreshBackend('dashboard')
  }
}