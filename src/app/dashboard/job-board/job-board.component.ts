import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BackendService } from '../../service/backend.service';
import { Store } from '@ngrx/store';
import { State } from 'src/app/root.reducers';
import { DashboardColumn, columnIds } from 'src/app/models/dashboard-column';
import { Observable, combineLatest, of, iif, noop, throwError } from 'rxjs';
import { map, first, switchMap, catchError, filter, mergeMap } from 'rxjs/operators';
import { DashboardActions } from 'src/app/shared/dashboard.action-types';
import { AppActions } from 'src/app/shared/app.action-types';
import { EstimateAssignmentComponent } from '../triggered-forms/estimate-assignment/estimate-assignment.component';
import { MatDialog } from '@angular/material/dialog';
import { AwardTimelineComponent } from '../triggered-forms/award-timeline/award-timeline.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from '../popups/confirmation-snackbar/confirmation-snackbar.component';
import { Estimate } from 'src/app/models/estimate';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-job-board',
  templateUrl: './job-board.component.html',
  styleUrls: ['./job-board.component.scss']
})
export class JobBoardComponent implements OnInit {
  @Output() boardUpdated = new EventEmitter<any>()
  columns: DashboardColumn[] = []
  isInitialized = false
  isDragging = false
  boxOptions: { id: number, name: string }[]
  estimators: { id: number, name: string }[]

  constructor(
    private backendService: BackendService,
    private dialog: MatDialog,
    private store: Store<State>,
    private snackBar: MatSnackBar,
  ) {
    this.boxOptions = new Array(10).fill(0).map((val, i) => ({ id: i + 1, name: (i + 1).toString() }))
    this.backendService.getData(environment.estimatorsTableName, { isActive: 1 }).subscribe(resp => {
      this.estimators = resp as { id: number, name: string }[]
      this.estimators.sort((a, b) => a.name.localeCompare(b.name))
    })

  }

  ngOnInit(): void {
    this.store.pipe(
      mergeMap(state => iif(() => state.dashboard.requery || !this.isInitialized, this.queryForData(state))),
    ).subscribe(
      cols => {
        this.columns = cols
        this.store.dispatch(DashboardActions.requeryComplete())
        this.store.dispatch(AppActions.stopLoading())
      })
    this.isInitialized = true
  }

  queryForData(state: State) {
    return of(state).pipe(
      map(state => state.dashboard.columns),
      switchMap(cols => {
        return combineLatest(cols.map(col => {
          return this.backendService.getData(col.dataTable).pipe(
            map((resp: any) => {
              return { ...col, items: resp } as DashboardColumn
            }),
            catchError(err => {
              console.log(`Unable to get a response from ${col.dataTable}`)
              console.log(err)
              return of({ ...col, items: [] } as DashboardColumn)
            })
          )
        }))
      }),
      switchMap((cols: DashboardColumn[]) => {
        return combineLatest(cols.map(col => {
          const statusTable = `status_options_${col.id}`
          return this.backendService.getData(statusTable)
            .pipe(
              map((resp: any[]) => {
                return { ...col, statusOptions: resp }
              }),
              catchError(err => {
                console.log(`Unable to get a response from ${statusTable}`)
                console.log(err)
                return of({ ...col, statusOptions: [] } as DashboardColumn)
              })
            )
        }))
      })
    )
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer !== event.container) {
      const dropColumnIndex = event.container.id
      const dropColumnId = this.columns[dropColumnIndex].id
      const selectedJob = event.previousContainer.data[event.previousIndex]
      switch (dropColumnId) {
        case (columnIds.ESTIMATING):
          this.dialog.open(EstimateAssignmentComponent, {
            width: '500px',
            data: {
              job: selectedJob,
              estimators: this.estimators,
              boxOptions: this.boxOptions
            },
            disableClose: true
          }).afterClosed().subscribe((resp: { boxId: number, estimatorId: number }) => {
            if (resp) {
              this.saveMove(event, false, resp)
            }
          })
          break;
        case (columnIds.AWARDED):
          this.dialog.open(AwardTimelineComponent, {
            width: '350px',
            data: {
              job: selectedJob,
              estimators: this.estimators,
              boxOptions: this.boxOptions
            },
            disableClose: true
          }).afterClosed().subscribe((resp: { startTime: string, endTime: string }) => {
            if (resp) {
              this.saveAwardTimeline(resp, selectedJob)
              this.saveMove(event)
            }
          })
          break;
        case (columnIds.PROPOSAL):
          if (selectedJob.total_estimates == 0)
            this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
              data: { message: "There are no estimates currently attached to this job. Are you sure you want to move to Proposal Sent?", action: "Move" }
            }).onAction().subscribe(
              () => {
                this.saveProposal(selectedJob.jobId, event)
              })
          else {
            this.saveProposal(selectedJob.jobId, event)
          }
          break;
        default:
          this.saveMove(event)
          break;
      }
    } else {
      // MOVE ITEMS WITHIN SAME LIST
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }


  private saveProposal(jobId: number, event: CdkDragDrop<any>) {
    this.backendService.getData(environment.currentProposalTableName, { jobId }).pipe(
      switchMap((resp: Estimate[]) => {
        const concreteEstimate = resp.find(estimate => estimate.type == 'concrete')
        const brickEstimate = resp.find(estimate => estimate.type == 'brick')
        const cmuEstimate = resp.find(estimate => estimate.type == 'cmu')
        const excavationEstimate = resp.find(estimate => estimate.type == 'excavation')
        const otherEstimate = resp.find(estimate => estimate.type == 'other')
        const proposal = {
          jobId,
          concreteId: concreteEstimate ? concreteEstimate.estimateId : null,
          brickId: brickEstimate ? brickEstimate.estimateId : null,
          cmuId: cmuEstimate ? cmuEstimate.estimateId : null,
          excavationId: excavationEstimate ? excavationEstimate.estimateId : null,
          otherId: otherEstimate ? otherEstimate.estimateId : null,
          dateSent: new Date().toISOString()
        }
        return this.backendService.saveData(environment.proposalWriteTableName, proposal)
      }),
      catchError(err => throwError(err)),
    ).subscribe(resp => {
      console.log(resp)
      this.saveMove(event, true, { boxId: null, estimatorId: null, proposalId: resp['insertId'] })
    },
      err => {
        console.log(err)
      },
      () => {
        this.boardUpdated.emit("Proposal Saved")
      })
  }

  private saveAwardTimeline(form: { startTime: string, endTime: string }, job: any) {
    this.backendService.saveData('awards_timeline', { jobId: job.jobId, ...form })
      .subscribe(resp => {
        console.log(resp)
      },
        err => {
          console.log(err)
          this.boardUpdated.emit(err.error.error.sqlMessage)
        },
        () => {
          this.boardUpdated.emit("Timeline saved for" + job.projectName)
        })
  }

  private saveMove(event: CdkDragDrop<any>, mute?: boolean, assignmentForm?: { boxId: number, estimatorId: number, proposalId?: number }) {
    // Set new status code for job
    event.previousContainer.data[event.previousIndex].statusId = this.columns[event.container.id].defaultStatusId

    //Move Job to new array
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    //Save Changes
    let payload = {
      jobId: event.container.data[event.currentIndex].jobId,
      date: new Date().toISOString(),
      statusId: this.columns[event.container.id].defaultStatusId,
      notes: event.container.data[event.currentIndex].notes,
      reportOnlyNotes: event.container.data[event.currentIndex].reportOnlyNotes,
      box: assignmentForm ? assignmentForm.boxId : null,
      assignedTo: assignmentForm ? assignmentForm.estimatorId : null,
      proposalId: assignmentForm ? assignmentForm.proposalId : null
    }

    if (assignmentForm && assignmentForm.estimatorId)
      payload['historyOnlyNotes'] = `Assigned to ${this.estimators.find(estimator => estimator.id == assignmentForm.estimatorId).name}`

    //Update old transaction to have the end date
    this.backendService.updateData('job_transactions', {
      set: { dateEnded: new Date().toISOString() },
      where: { id: event.container.data[event.currentIndex].transactionId }
    }).pipe(mergeMap(() => {
      return this.backendService.saveData('job_transactions', payload)
    }))
      .subscribe(resp => {
        console.log(resp)
      },
        err => {
          console.log(err)
          this.boardUpdated.emit(err.error.error.sqlMessage)
        },
        () => {
          this.store.dispatch(DashboardActions.requery())
          if (!mute)
            this.boardUpdated.emit("Job board updated")
        })
  }

  onIsDragging(event) {
    this.isDragging = event
  }
}
