import { trigger, state, style, transition, animate } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { fromEvent, noop, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { ConfirmationSnackbarComponent } from 'src/app/popups/confirmation-snackbar/confirmation-snackbar.component';
import { BackendService } from 'src/app/services/backend.service';
import { EventService } from 'src/app/services/event.service';
import { showSnackbar } from 'src/app/shared/utility';
import { AppState } from 'src/models/appState';
import { AssignBidFormComponent } from '../dashboard/assign-bid-form/assign-bid-form.component';
import { AwardTimelineFormComponent } from '../dashboard/award-timeline-form/award-timeline-form.component';
import { DashboardActions } from '../dashboard/dashboard.action-types';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnDestroy {
  searchTerm: string = ''
  sortCol: string = ""
  data: MatTableDataSource<any>
  displayedColumns: string[]
  expandedElement: any
  noData: boolean = false

  data$: Observable<MatTableDataSource<any>>
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchButton') searchButton: MatButton
  @ViewChild('search') searchField: ElementRef

  confirmationFormSubscription: Subscription
  timelineFormSubscription: Subscription
  assignmentFormSubscription: Subscription

  constructor(
    private backendService: BackendService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private eventService: EventService,
    private dialog: MatDialog,
  ) { }

  ngOnDestroy() {
    console.log("DESTROY")
    this.confirmationFormSubscription.unsubscribe()
    this.timelineFormSubscription.unsubscribe()
    this.assignmentFormSubscription.unsubscribe()
  }

  ngOnInit(): void {
    this.backendService.initSearch()

    // NEARLY THE SAME CODE FROM DASHBOARD COMPONENT -> NEEDS TO BE CLEANED UP
    this.confirmationFormSubscription = this.eventService.confirmProposal.pipe(
      tap(() => console.log("CONFIRMATION EVENT")),
      switchMap(action => {
        // If it is dropped back on the same column, do nothing
        if (action.selectedJob.currentDashboardColumn == 'proposal') return of({ action, skipProposal: true })

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
      debugger
      if (!propId) return this.eventService.searchMoveFormCanceled.next({ jobId: action.selectedJob.jobId })
      this.store.dispatch(DashboardActions.jobMoved({
        ...action,
        selectedJob: {
          ...action.selectedJob,
          historyOnlyNotes: `Moved to Proposal`,
          proposalId: propId,
          assignedTo: 0
        }
      }))
      this.store.dispatch(DashboardActions.boxCleared({ boxId: action.selectedJob.box }))
      showSnackbar(this.snackBar, "Job Moved")

    },
      err => console.log(err)
    )

    this.timelineFormSubscription = this.eventService.triggerTimelineForm.pipe(
      switchMap(action => {
        if (action.selectedJob.currentDashboardColumn == 'awarded') return of(null)
        console.log("TIMELINE EVENT")
        return this.dialog.open(AwardTimelineFormComponent, {
          width: '500px',
          data: action.selectedJob
        }).afterClosed().pipe(
          first(),
          map(resp => {
            return resp
              ? { ...action, selectedJob: resp, formComplete: true }
              : { formComplete: false, ...action }
          }))
      })
    ).subscribe(action => {
      if (!action.formComplete) return this.eventService.searchMoveFormCanceled.next({ jobId: action.selectedJob.jobId })
      this.store.dispatch(DashboardActions.jobMoved({
        ...action,
        selectedJob: {
          ...action.selectedJob,
          historyOnlyNotes: `Moved to Awarded`
        }
      }))
      this.store.dispatch(DashboardActions.boxCleared({ boxId: action.selectedJob.box }))
      showSnackbar(this.snackBar, "Job Moved")
    })

    this.assignmentFormSubscription = this.eventService.triggerAssignmentFrom.pipe(
      tap(() => console.log("ASSIGNMENT EVENT")),
      switchMap(action => {
        if (action.selectedJob.currentDashboardColumn == 'estimating') return of(null)
        return this.dialog.open(AssignBidFormComponent, {
          width: '500px',
          data: action.selectedJob
        }).afterClosed().pipe(
          first(),
          map(resp => {
            return resp
              ? { ...action, ...resp, formComplete: true }
              : { ...action, formComplete: false }
          }))
      })
    ).subscribe(action => {
      if (action) {
        if (!action.formComplete) return this.eventService.searchMoveFormCanceled.next({ jobId: action.selectedJob.jobId })
        this.store.dispatch(DashboardActions.jobMoved({
          ...action,
          selectedJob: {
            ...action.selectedJob,
            historyOnlyNotes: `Moved to Estimating; Assigned to ${action.name}`
          }
        }))
        this.store.dispatch(DashboardActions.boxSet({
          boxId: action.selectedJob.box, projectId: action.selectedJob.projectId
        }))
        showSnackbar(this.snackBar, "Job Moved")
      }
    })
  }


  async onSearch(searchValue: string) {
    this.noData = false
    let resp = await this.backendService.getSearch(searchValue.replace(/\'/g, "\\\'").trim()) as any[]
    if (!resp.length) return this.noData = true
    this.displayedColumns = Object.keys(resp[0]).filter((key, i) => i)
    this.data = new MatTableDataSource(resp)
    this.data.sort = this.sort
    this.data$ = this.backendService.saveData('search', searchValue.replace(/\'/g, "\\\'").trim()).pipe(
      tap(resp => showSnackbar(this.snackBar, `${resp.length} ${resp.length == 1 ? 'item' : 'items'} found`)),
      map(resp => new MatTableDataSource(resp))
    )
  }

  onSortChanged() {
    this.data.sort = this.sort
  }

  onExpand(job) {
    console.log(job)
  }

}
