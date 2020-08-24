import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Estimate } from 'src/app/models/estimate';


@Component({
  selector: 'estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit {
  @Input() estimates: Estimate[] = []
  @Output() deleted = new EventEmitter<Estimate>()
  projectValue: number = 0
  outsourceCost: number = 0
  constructor(
  ) { }

  ngOnInit(): void {
    this.projectValue = this.estimates.map(estimate => +estimate.cost).reduce((acc, cur) => acc += cur, 0)
    this.outsourceCost = this.estimates.map(estimate => +estimate.fee).reduce((acc, cur) => acc += cur, 0)
  }



  onDelete(estimate: Estimate) {
    this.deleted.emit(estimate)
  }

}
