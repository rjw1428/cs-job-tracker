import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-estimate-view',
  templateUrl: './estimate-view.component.html',
  styleUrls: ['./estimate-view.component.scss']
})
export class EstimateViewComponent implements OnInit {
  finalValue = { finalCost: null, note: null }
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { estimates: any, job: any, proposalId: number }
  ) { }

  ngOnInit(): void {
    debugger
    if (this.data.proposalId == this.data.job.proposalId) {
      this.finalValue.finalCost = this.data.job.finalCost
      this.finalValue.note = this.data.job.finalCostNote
    }
  }

}
