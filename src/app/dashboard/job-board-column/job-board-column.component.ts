import { Component, OnInit, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { DashboardColumn, columnIds } from 'src/app/models/dashboard-column';

@Component({
  selector: 'app-job-board-column',
  templateUrl: './job-board-column.component.html',
  styleUrls: ['./job-board-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobBoardColumnComponent implements OnInit {
  @Input() columnConfig: DashboardColumn
  @Input() boxOptions: any[]
  @Input() estimatorOptions: { id: number, name: string }[]
  @Output() isDragging = new EventEmitter<boolean>()
  itemStatusOptions: Object[]
  sortDirection: "asc" | "desc" = "asc"
  sortKey: string = 'projectName'
  isAwardedCol: boolean = false
  constructor() { }

  ngOnInit(): void {
    this.isAwardedCol = this.columnConfig.id == columnIds.AWARDED
    this.itemStatusOptions = this.columnConfig.statusOptions
    this.columnConfig = {
      ...this.columnConfig,
      items: this.columnConfig.items.sort((a,b)=>this.sortFn(a,b, this.sortKey, this.sortDirection))
    }
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

  onSortSelected(sortKey: string, direction: "asc" | "desc")  {
    this.sortKey = sortKey
    this.sortDirection = direction
    this.columnConfig = {
      ...this.columnConfig,
      items: this.columnConfig.items.sort((a,b)=>this.sortFn(a,b, this.sortKey, this.sortDirection))
    }
  }

  sortFn(a,b, key, direction) {
    const objA = a[key]
    const objB = b[key]
    
    return objA > objB
      ? direction == 'asc' ? 1 : -1
      : objA < objB
        ? direction == 'asc' ? -1 : 1
        : 0
  }
}
