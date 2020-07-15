import { Component, OnInit, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { DashboardColumn } from 'src/app/models/dashboard-column';

@Component({
  selector: 'app-job-board-column',
  templateUrl: './job-board-column.component.html',
  styleUrls: ['./job-board-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobBoardColumnComponent implements OnInit {
  @Input() columnConfig: DashboardColumn
  @Output() isDragging = new EventEmitter<boolean>()
  itemStatusOptions: Object[]
  constructor() { }

  ngOnInit(): void {
    this.itemStatusOptions = this.columnConfig.queryParams['statusId']
  }

  onItemDeleted(deletedJobId) {
    const index = this.columnConfig.items.findIndex(job => job.jobId = deletedJobId)
    this.columnConfig.items.splice(index, 1)
  }

  onDragStart() {
    this.isDragging.emit(true)
  }

  onDragRelease() {
    this.isDragging.emit(false)
  }
}
