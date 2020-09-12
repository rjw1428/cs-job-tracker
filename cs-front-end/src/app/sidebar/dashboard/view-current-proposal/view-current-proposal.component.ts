import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from 'src/models/job';
import { Estimate } from 'src/models/estimate';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/appState';
import { singleProposalSelector } from '../dashboard.selectors';
import { Proposal } from 'src/models/proposal';

@Component({
  selector: 'app-view-current-proposal',
  templateUrl: './view-current-proposal.component.html',
  styleUrls: ['./view-current-proposal.component.scss']
})
export class ViewCurrentProposalComponent implements OnInit {
  proposal$: Observable<Proposal>
  constructor(
  private backendService: BackendService,
  private store: Store<AppState>,
  @Inject(MAT_DIALOG_DATA) public job: Job) { }

  ngOnInit(): void {
    this.backendService.initViewProposal(this.job.proposalId, this.job)

    this.proposal$ = this.store.select(singleProposalSelector)
  }
}