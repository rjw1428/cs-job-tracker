import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from 'src/models/job';
import { BackendService } from 'src/app/services/backend.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Proposal } from 'src/models/proposal';
import { AppState } from 'src/models/appState';
import { MatAccordion } from '@angular/material/expansion';
import { proposalHistorySelector } from '../dashboard.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from 'src/app/popups/confirmation-snackbar/confirmation-snackbar.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-view-proposal-history',
  templateUrl: './view-proposal-history.component.html',
  styleUrls: ['./view-proposal-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewProposalHistoryComponent implements OnInit {
  proposals$: Observable<Proposal[]>
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor(
    private backendService: BackendService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public job: Job) { }

  ngOnInit(): void {
    this.backendService.initViewProposalHistory(this.job)

    this.proposals$ = this.store.select(proposalHistorySelector)
  }

  onProposalDelete(proposal: Proposal) {
    const d = new DatePipe('en-US').transform(proposal.dateSent, 'short')
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
      data: { message: `Are you sure you want to delete the proposal from ${d}?`, action: "Delete" }
    }).onAction().subscribe(
      () => this.backendService.deleteProposal(proposal.id, this.job)
    )
  }

}
