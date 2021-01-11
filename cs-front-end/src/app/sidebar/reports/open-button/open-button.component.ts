import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JobItemComponent } from '../job-item/job-item.component';

@Component({
  selector: 'app-open-button',
  templateUrl: './open-button.component.html',
  styleUrls: ['./open-button.component.scss']
})
export class OpenButtonComponent implements OnInit {
  @Input() jobId: number
  constructor(
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {
  }

  onOpen() {
     this.dialog.open(JobItemComponent, {
      width: '1000px',
      data: this.jobId
    })
  }
}
