import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-estimate-view',
  templateUrl: './estimate-view.component.html',
  styleUrls: ['./estimate-view.component.scss']
})
export class EstimateViewComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { estimate: any, job: any }
  ) { }

  ngOnInit(): void {
  }

}
