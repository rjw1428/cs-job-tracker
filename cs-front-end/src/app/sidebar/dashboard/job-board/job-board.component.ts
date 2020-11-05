import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DashboardColumn } from 'src/models/dashboardColumn';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { noop, Observable } from 'rxjs';
import { columnsSelector } from '../dashboard.selectors';
import { DashboardActions } from '../dashboard.action-types';
import { Job } from 'src/models/job';
import { first, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-job-board',
  templateUrl: './job-board.component.html',
  styleUrls: ['./job-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobBoardComponent implements OnInit {
  @Output() boardUpdated = new EventEmitter<string>()
  columns$: Observable<DashboardColumn[]>
  isInitialized = false
  isDragging = false
  dragItemId: number
  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.columns$ = this.store.select(columnsSelector)
  }

  drop(event: CdkDragDrop<any>) {
    const sourceColIndex = event.previousContainer.id
    const sourceOrderIndex = event.previousIndex
    const targetColIndex = event.container.id
    const targetOrderIndex = 0//event.currentIndex
    // const selectedJobId = event.previousContainer.data[sourceOrderIndex]
    // console.log({
    //   sourceColIndex,
    //   sourceOrderIndex,
    //   targetColIndex,
    //   targetOrderIndex,
    //   selectedJobId
    // })
    if (this.dragItemId)
      this.store.pipe(first(), map(state => {
        // const selectedJobId = state.dashboard.dragItem
        const selectedJob = state.dashboard.invites[this.dragItemId]
        this.store.dispatch(DashboardActions.jobMoveForm({
          sourceColIndex,
          sourceOrderIndex,
          targetColIndex,
          targetOrderIndex,
          selectedJob
        }))
      })).subscribe(noop)
  }

  onIsDragging(jobId: number | null) {
    this.isDragging = !!jobId
    console.log(!!jobId ? "setting id" : "clearing id")

    // At end of call stack, clear the drag item (allows drop() event to run with the ID)
    setTimeout(() => {
      this.dragItemId = jobId
    })
  }

}
