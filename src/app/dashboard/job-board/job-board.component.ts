import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BackendService } from '../../service/backend.service';
import { Store } from '@ngrx/store';
import { State } from 'src/app/root.reducers';
import { DashboardColumn } from 'src/app/models/dashboard-column';
import { Observable, combineLatest, of, iif, noop } from 'rxjs';
import { map, first, switchMap, catchError, filter, mergeMap } from 'rxjs/operators';
import { DashboardActions } from 'src/app/shared/dashboard.action-types';
import { AppActions } from 'src/app/shared/app.action-types';

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
  constructor(
    private backendService: BackendService,
    private store: Store<State>
  ) { }

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
        return this.backendService.getData('job_status_options').pipe(
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

  drop(event) {
    if (event.previousContainer !== event.container) {
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
        notes: event.container.data[event.currentIndex].notes
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
    } else {
      // MOVE ITEMS WITHIN SAME LIST
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  onIsDragging(event) {
    this.isDragging = event
  }
}
