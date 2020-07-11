import { Component, OnInit, ViewChild, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-job-history-view',
  templateUrl: './job-history-view.component.html',
  styleUrls: ['./job-history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobHistoryViewComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  displayedColumns: string[]
  dataSource: any
  constructor(@Inject(MAT_DIALOG_DATA) public data: { transactions: any[], job: any }) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data.transactions);
    this.displayedColumns = Object.keys(this.data.transactions[0]).slice(1)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getTotal() {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = this.convertTimestampToDate(new Date(this.data.transactions[0].date));
    const lastDate = this.convertTimestampToDate(new Date(this.data.transactions[this.data.transactions.length - 1].date));
    return Math.ceil((+lastDate - +firstDate) / oneDay) + 1
  }

  convertTimestampToDate(timestamp: Date) {
    const year = timestamp.getFullYear()
    const month = timestamp.getMonth()
    const date = timestamp.getDate()
    return new Date(year, month, date)
  }
}
