import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from '../popups/confirmation-snackbar/confirmation-snackbar.component';
import { switchMap } from 'rxjs/operators';
import { showSnackbar } from 'src/app/shared/utility';
import { MatDialog } from '@angular/material/dialog';
import { EstimateViewComponent } from '../popups/estimate-view/estimate-view.component';
import { EstimateHistoryViewComponent } from '../popups/estimate-history-view/estimate-history-view.component';
import { JobHistoryViewComponent } from '../popups/job-history-view/job-history-view.component';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-job-board-item',
  templateUrl: './job-board-item.component.html',
  styleUrls: ['./job-board-item.component.scss']
})
export class JobBoardItemComponent implements OnInit {
  @Input() job: any
  @Input() statusOptions: { id: number, status: string }[]
  @Output('deleted') jobDeleted = new EventEmitter<number>()
  mailTo: string
  selectedStatus: { id: number, status: string }
  constructor(
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.mailTo = this.job.contactEmail + "?subject=" + encodeURIComponent(this.job.projectName)
    this.selectedStatus = this.statusOptions.find(option => option.id == this.job.statusId)
  }


  onStatusChanged(value: MatSelectChange) {
    this.backendService.updateData('job_transactions', {
      set: { statusId: value.value.id },
      where: { id: this.job.transactionId }
    })
      .subscribe(
        resp => {
          console.log(resp)
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error.sqlMessage)
        },
        () => showSnackbar(this.snackBar, "Job status updated")
      )
  }

  onSaveNote() {
    this.backendService.updateData('job_transactions', {
      set: { notes: this.job.notes },
      where: { id: this.job.transactionId }
    })
      .subscribe(
        resp => {
          console.log(resp)
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error.sqlMessage)
        },
        () => showSnackbar(this.snackBar, "Note updated")
      )
  }

  onOpenCurrentEstimate() {
    this.backendService.getData('estimates_history', { estimateId: this.job.current_estimate_id })
      .subscribe(resp => {
        this.dialog.open(EstimateViewComponent, {
          width: '700px',
          data: { estimate: resp[0], job: this.job }
        });
      })
  }

  onEstimateHistory() {
    this.backendService.getData('estimates_history', { jobId: this.job.jobId })
      .subscribe(resp => {
        this.dialog.open(EstimateHistoryViewComponent, {
          width: '700px',
          data: { estimates: resp, job: this.job }
        });
      })
  }

  onJobHistory() {
    this.backendService.getData('job_history', { jobId: this.job.jobId })
      .subscribe(resp => {
        this.dialog.open(JobHistoryViewComponent, {
          width: '700px',
          data: { transactions: resp, job: this.job }
        });
      })
  }

  onDelete() {
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent).onAction().pipe(
      switchMap(() => {
        return this.backendService.updateData("job_state", {
          set: { isActive: 0 },
          where: { jobId: this.job.jobId }
        })
      })
    )
      .subscribe(
        resp => {
          this.jobDeleted.emit(this.job.jobId)
          showSnackbar(this.snackBar, `${this.job.projectName} has been removed`)
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error.sqlMessage)
        }
      )
  }
}
