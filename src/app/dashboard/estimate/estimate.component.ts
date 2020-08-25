import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Estimate } from 'src/app/models/estimate';


@Component({
  selector: 'estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit {
  @Input() proposalId: number
  @Input() estimates: Estimate[] = []
  @Input() deletable: boolean = false
  @Output() deleted = new EventEmitter<number>()
  projectValue: number = 0
  outsourceCost: number = 0
  constructor(
  ) { }

  ngOnInit(): void {
    this.projectValue = this.estimates.map(estimate => +estimate.cost).reduce((acc, cur) => acc += cur, 0)
    this.outsourceCost = this.estimates.map(estimate => +estimate.fee).reduce((acc, cur) => acc += cur, 0)
  }

  onDelete() {
    this.deleted.emit(this.proposalId)
  }

}
