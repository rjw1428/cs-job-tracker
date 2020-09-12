import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Estimate } from 'src/models/estimate';
import { Proposal } from 'src/models/proposal';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'single-proposal',
  templateUrl: './single-proposal.component.html',
  styleUrls: ['./single-proposal.component.scss']
})
export class SingleProposalComponent implements OnInit {
  @Input() proposal: Proposal
  @Input() deletable: boolean = false
  @Output() delete = new EventEmitter<Proposal>()
  constructor(
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
  }

  onDelete() {
    this.delete.emit(this.proposal)
  }
}
