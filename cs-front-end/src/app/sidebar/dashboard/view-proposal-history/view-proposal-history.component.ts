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
    @Inject(MAT_DIALOG_DATA) public job: Job) { }

  ngOnInit(): void {
    this.backendService.initViewProposalHistory(this.job)

    this.proposals$ = this.store.select(proposalHistorySelector)
  }

}
