import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { HistoryEntry } from 'src/models/historyEntry';
import { jobHistorySelector } from '../dashboard.selectors';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/appState';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from 'src/models/job';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardActions } from '../dashboard.action-types';
import { ViewCurrentProposalComponent } from '../view-current-proposal/view-current-proposal.component';

@Component({
  selector: 'app-view-job-history',
  templateUrl: './view-job-history.component.html',
  styleUrls: ['./view-job-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewJobHistoryComponent implements OnInit {
  dataSource: any
  displayedColumns: string[]
  transactions: HistoryEntry[] = []
  constructor(
    private backendService: BackendService,
    private store: Store<AppState>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public job: Job) { }

  ngOnInit(): void {
    this.backendService.initViewJobHistory(this.job)

    this.store.select(jobHistorySelector).subscribe(transactions => {
      if (transactions.length) {
        this.transactions = transactions
        this.displayedColumns = Object.keys(transactions[0]).slice(2, 6)
        this.dataSource = new MatTableDataSource(transactions)
      }
    })

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onProposalSelected(element) {
    this.store.dispatch(DashboardActions.clearSelectedProposal())
    this.dialog.open(ViewCurrentProposalComponent, {
      width: '700px',
      data: { ...this.job, proposalId: element.proposalId }
    });
  }

  getTotal() {
    const seconds = this.transactions.map(transaction => transaction['Time Spent']).reduce((acc, cur) => cur > 0 ? acc + cur : acc, 0)
    return this.getTime(seconds)
  }

  getTime(seconds) {
    const d = Math.floor(seconds / 86400)
    const hr = Math.floor(seconds / 3600) - (d * 24)
    const min = Math.floor(seconds / 60) - (hr * 60)
    const s = seconds % 60
    return (d ? d + ":" : "") + this.padNumber(hr) + ":" + this.padNumber(min) + ":" + this.padNumber(s)
  }

  padNumber(n: number): string {
    return n < 10 ? '0' + n : n.toString()
  }
}
