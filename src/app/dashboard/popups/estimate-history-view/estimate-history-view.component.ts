import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from 'src/app/service/backend.service';
import { ConfirmationSnackbarComponent } from '../confirmation-snackbar/confirmation-snackbar.component';
import { switchMap } from 'rxjs/operators';
import { showSnackbar } from 'src/app/shared/utility';
import { Estimate } from 'src/app/models/estimate';

@Component({
  selector: 'app-estimate-history-view',
  templateUrl: './estimate-history-view.component.html',
  styleUrls: ['./estimate-history-view.component.scss']
})
export class EstimateHistoryViewComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  initialEstimateCount: number
  constructor(
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private dialogRef: MatDialogRef<EstimateHistoryViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estimates: any[], job: any }
  ) { }

  ngOnInit(): void {
    this.initialEstimateCount = this.data.estimates.length
    this.dialogRef.beforeClosed().subscribe(()=>{
      this.dialogRef.close(this.data.estimates.length != this.initialEstimateCount)
    })
  }

  onEstimateDeleted(estimate: Estimate) {
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
      data: {message: "Are you sure you want to remove this estimate?", action: "Delete"}
    }).onAction()
      .pipe(
        switchMap(() => {
          return this.backendService.deleteData("estimates_to_jobs", { mapId: estimate.mapId }
          )
        })
      )
      .subscribe(
        resp => {
          const matchingFileIndex = this.data.estimates.findIndex(e => e.estimateId == estimate.estimateId)
          this.data.estimates.splice(matchingFileIndex, 1)
          showSnackbar(this.snackBar, `Estimate has been removed`)
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error.sqlMessage)
        }
      )
  }

}
