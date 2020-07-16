import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Estimate } from 'src/app/models/estimate';


@Component({
  selector: 'estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit {
  @Input() estimate: Estimate
  @Output() deleted = new EventEmitter<Estimate>()
  constructor(
  ) { }

  ngOnInit(): void {
  }



  onDelete(estimate: Estimate) {
    this.deleted.emit(estimate)
  }

}
