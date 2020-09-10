import { Component, OnInit, Input } from '@angular/core';
import { Estimate } from 'src/models/estimate';
import { Proposal } from 'src/models/proposal';

@Component({
  selector: 'single-proposal',
  templateUrl: './single-proposal.component.html',
  styleUrls: ['./single-proposal.component.scss']
})
export class SingleProposalComponent implements OnInit {
  @Input() proposal: Proposal
  @Input() deletable: boolean = false
  constructor() { }

  ngOnInit(): void {
  }

  onDelete() {
    console.log("DELETE PROPOSAL")
  }
}
