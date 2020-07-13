import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from '../popups/confirmation-snackbar/confirmation-snackbar.component';
import { switchMap, map } from 'rxjs/operators';
import { showSnackbar } from 'src/app/shared/utility';
import { MatDialog } from '@angular/material/dialog';
import { EstimateViewComponent } from '../popups/estimate-view/estimate-view.component';
import { EstimateHistoryViewComponent } from '../popups/estimate-history-view/estimate-history-view.component';
import { JobHistoryViewComponent } from '../popups/job-history-view/job-history-view.component';
import { MatSelectChange } from '@angular/material/select';
import { UpdateDueDateComponent } from 'src/app/forms/update-due-date/update-due-date.component';
import { iif, of, noop } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-job-board-item',
  templateUrl: './job-board-item.component.html',
  styleUrls: ['./job-board-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobBoardItemComponent implements OnInit {
  @Input() job: any
  @Input() statusOptions: { id: number, status: string }[]
  @Input() showBoxField: boolean
  @Output('deleted') jobDeleted = new EventEmitter<number>()
  mailTo: string
  selectedStatus: { id: number, status: string }
  selectedBox: { id: number, name: string }
  boxOptions: { id: number, name: string }[]
  isDev: boolean = false;
  constructor(
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.boxOptions = new Array(10).fill(0).map((val, i) => ({ id: i + 1, name: (i + 1).toString() }))
  }

  ngOnInit(): void {
    this.isDev = location.hostname == 'localhost'
    this.mailTo = this.job.contactEmail + "?subject=" + encodeURIComponent(this.job.projectName)
    this.selectedStatus = this.statusOptions.find(option => option.id == this.job.statusId)
    this.selectedBox = this.boxOptions.find(option => option.id == this.job.box)
  }

  onStatusChanged(value: MatSelectChange) {
    const responseMessage = "Status updated"
    this.job.statusId = value.value.id
    // this.updateTransaction('statusId', responseMessage)
    const partialPayload = {
      statusId: value.value.id,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes
    }
    this.saveTransaction(partialPayload, responseMessage)
  }

  onSaveNote() {
    const responseMessage = "Notes updated"
    // this.updateTransaction('notes',responseMessage)
    const partialPayload = {
      statusId: this.job.statusId,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes
    }
    this.saveTransaction(partialPayload, responseMessage)
  }

  onBoxChanged(value: MatSelectChange) {
    this.job.box = value.value.id
    this.updateTransaction('box', "Box updated")
  }

  onOpenCurrentEstimate() {
    if (this.job.current_estimate_id) {
      this.backendService.getData('estimates_history', { estimateId: this.job.current_estimate_id })
        .subscribe(resp => {
          this.dialog.open(EstimateViewComponent, {
            width: '700px',
            data: { estimate: resp[0], job: this.job }
          });
        })
    } else {
      this.dialog.open(EstimateViewComponent, {
        width: '700px',
        data: { estimate: null, job: this.job }
      });
    }
  }

  onDueDateSelected() {
    this.dialog.open(UpdateDueDateComponent, {
      width: '400px',
      data: { ...this.job }
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

  updateTransaction(key: string, responseMessage: string) {
    this.backendService.updateData('job_transactions', {
      set: { [key]: this.job[key] },
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
        () => showSnackbar(this.snackBar, responseMessage)
      )
  }


  saveTransaction(partialPayload: { statusId: number, box: number, notes: string }, responseMessage) {
    this.backendService.saveData('job_transactions', {
      jobId: this.job.jobId,
      date: new Date().toISOString(),
      ...partialPayload
    }).subscribe(
      resp => {
        console.log(resp)
        this.job.transactionId = resp['insertId']
      },
      err => {
        console.log(err)
        showSnackbar(this.snackBar, err.error.error.sqlMessage)
      },
      () => showSnackbar(this.snackBar, responseMessage)
    )
  }
}
