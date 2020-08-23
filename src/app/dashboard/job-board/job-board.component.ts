import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BackendService } from '../../service/backend.service';
import { Store } from '@ngrx/store';
import { State } from 'src/app/root.reducers';
import { DashboardColumn, columnIds } from 'src/app/models/dashboard-column';
import { Observable, combineLatest, of, iif, noop } from 'rxjs';
import { map, first, switchMap, catchError, filter, mergeMap } from 'rxjs/operators';
import { DashboardActions } from 'src/app/shared/dashboard.action-types';
import { AppActions } from 'src/app/shared/app.action-types';
import { EstimateAssignmentComponent } from '../triggered-forms/estimate-assignment/estimate-assignment.component';
import { MatDialog } from '@angular/material/dialog';
import { AwardTimelineComponent } from '../triggered-forms/award-timeline/award-timeline.component';

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
  readonly estimatorsTableName = 'estimators'
  constructor(
    private backendService: BackendService,
    private dialog: MatDialog,
    private store: Store<State>
  ) {
    this.boxOptions = new Array(10).fill(0).map((val, i) => ({ id: i + 1, name: (i + 1).toString() }))
    this.backendService.getData(this.estimatorsTableName, { isActive: 1 }).subscribe(resp => {
      this.estimators = resp as { id: number, name: string }[]
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
        return this.backendService.getData('options_job_status').pipe(
          map((resp: any[]) => {
            return cols.map(col => {
              const options = col.queryParams["statusId"]
              const validOptions = (typeof options == 'object')
                ? resp.filter(statusObj => options.includes(statusObj.id))
                : [resp.find(statusObj => statusObj.id == options)]

              return { ...col, statusOptions: validOptions }
            })
          })
        )
      }),
      switchMap(cols => {
        return combineLatest(cols.map(col => {
          return this.backendService.getData(col.dataTable, col.queryParams)
            .pipe(
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
              this.saveMove(event, resp)
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
        default:
          this.saveMove(event)
          break;
      }
    } else {
      // MOVE ITEMS WITHIN SAME LIST
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
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

  private saveMove(event: CdkDragDrop<any>, assignmentForm?: { boxId: number, estimatorId: number }) {
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
    const payload = {
      jobId: event.container.data[event.currentIndex].jobId,
      date: new Date().toISOString(),
      statusId: this.columns[event.container.id].defaultStatusId,
      notes: event.container.data[event.currentIndex].notes,
      box: assignmentForm ? assignmentForm.boxId : null,
      assignedTo: assignmentForm ? assignmentForm.estimatorId : null
    }
    this.backendService.saveData('job_transactions', payload)
      .subscribe(resp => {
        console.log(resp)
      },
        err => {
          console.log(err)
          this.boardUpdated.emit(err.error.error.sqlMessage)
        },
        () => {
          this.store.dispatch(DashboardActions.requery())
          this.boardUpdated.emit("Job board updated")
        })
  }

  onIsDragging(event) {
    this.isDragging = event
  }
}
