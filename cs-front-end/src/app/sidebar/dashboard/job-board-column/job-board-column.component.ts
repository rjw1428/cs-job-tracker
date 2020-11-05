import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DashboardColumn } from 'src/models/dashboardColumn';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { itemsSelector } from '../dashboard.selectors';
import { Observable } from 'rxjs';
import { Job } from 'src/models/job';
import { DashboardActions } from '../dashboard.action-types';
import { map, first } from 'rxjs/operators';

@Component({
  selector: 'app-job-board-column',
  templateUrl: './job-board-column.component.html',
  styleUrls: ['./job-board-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobBoardColumnComponent implements OnInit {
  @Input() columnConfig: DashboardColumn
  @Output() isDragging = new EventEmitter<number>()
  items$: Observable<Job[]>
  isAwardedCol: boolean = false
  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.isAwardedCol = this.columnConfig.id == 'awarded'
    this.items$ = this.store.select(itemsSelector, { columnId: this.columnConfig.id })
  }

  onShortcutMenuSelect(targetColIndex: string, selectedJob: Job) {
    const sourceColIndex = selectedJob.currentDashboardColumn
    const targetOrderIndex = 0
    const sourceOrderIndex = 0
    this.store.dispatch(DashboardActions.jobMoveForm({
      sourceColIndex,
      sourceOrderIndex,
      targetColIndex,
      targetOrderIndex,
      selectedJob
    }))
  }

  onSortSelected(sortKey: string, direction: "asc" | "desc") {
    this.store.dispatch(DashboardActions.onColumnSort({ columnId: this.columnConfig.id, sortKey, direction }))
    localStorage[this.columnConfig.id] = JSON.stringify({ key: sortKey, direction })
  }


  onDragStart(job: Job) {
    this.isDragging.emit(job.jobId)
  }

  onDragRelease(job: Job) {
    this.isDragging.emit(null)
  }
}
