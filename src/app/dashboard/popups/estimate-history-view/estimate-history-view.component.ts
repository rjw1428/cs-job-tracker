import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-estimate-history-view',
  templateUrl: './estimate-history-view.component.html',
  styleUrls: ['./estimate-history-view.component.scss']
})
export class EstimateHistoryViewComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { estimates: any[], job: any }
  ) { }

  ngOnInit(): void {
  }

}
