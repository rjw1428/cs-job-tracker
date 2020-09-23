import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
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
  @Output() delete = new EventEmitter<Proposal>()
  @Output() deleteEstimate = new EventEmitter<{mapId: number, type: string}>()
  constructor(
  ) { }

  ngOnInit(): void {
    console.log(this.proposal)
  }

  onDelete() {
    this.delete.emit(this.proposal)
  }

  onRemoveEstimate(estimate: Estimate) {
    this.deleteEstimate.emit({mapId: estimate.mapId, type: estimate.type})
  }
}
