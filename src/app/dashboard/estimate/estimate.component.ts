import { Component, OnInit, Input } from '@angular/core';
import { Estimate } from 'src/app/models/estimate';

@Component({
  selector: 'estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit {
  @Input() estimate: Estimate
  constructor() { }

  ngOnInit(): void {
  }

}
