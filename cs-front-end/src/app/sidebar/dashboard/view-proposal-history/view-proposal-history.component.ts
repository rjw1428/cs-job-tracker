import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from 'src/models/job';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-view-proposal-history',
  templateUrl: './view-proposal-history.component.html',
  styleUrls: ['./view-proposal-history.component.scss']
})
export class ViewProposalHistoryComponent implements OnInit {

  constructor(
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) { }

  ngOnInit(): void {
  }

}
