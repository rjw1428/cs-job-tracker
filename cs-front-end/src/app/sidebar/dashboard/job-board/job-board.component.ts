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
    const targetOrderIndex = event.currentIndex
    const selectedJobId = event.previousContainer.data[sourceOrderIndex]
    debugger
    this.store.pipe(first(), map(state => {
      const selectedJob = state.dashboard.invites[selectedJobId]
      this.store.dispatch(DashboardActions.jobMoveForm({
        sourceColIndex,
        sourceOrderIndex,
        targetColIndex,
        targetOrderIndex,
        selectedJob
      }))
    })).subscribe(noop)
  }

  onIsDragging(event) {
    this.isDragging = event
  }

}
