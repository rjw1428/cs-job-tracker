import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from '../popups/confirmation-snackbar/confirmation-snackbar.component';
import { switchMap, map, shareReplay } from 'rxjs/operators';
import { showSnackbar } from 'src/app/shared/utility';
import { MatDialog } from '@angular/material/dialog';
import { EstimateViewComponent } from '../popups/estimate-view/estimate-view.component';
import { EstimateHistoryViewComponent } from '../popups/estimate-history-view/estimate-history-view.component';
import { JobHistoryViewComponent } from '../popups/job-history-view/job-history-view.component';
import { MatSelectChange } from '@angular/material/select';
import { UpdateDueDateComponent } from 'src/app/forms/update-due-date/update-due-date.component';
import { iif, of, noop, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddFileComponent } from 'src/app/forms/add-file/add-file.component';
import { FileListComponent } from '../popups/file-list/file-list.component';
import { AttachedFile } from 'src/app/models/attached-file';
import { AppState } from 'src/app/models/app';
import { Store } from '@ngrx/store';
import { DashboardActions } from 'src/app/shared/dashboard.action-types';
import { columnIds } from 'src/app/models/dashboard-column';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AwardDiscountComponent } from '../triggered-forms/award-discount/award-discount.component';

@Component({
  selector: 'app-job-board-item',
  templateUrl: './job-board-item.component.html',
  styleUrls: ['./job-board-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobBoardItemComponent implements OnInit {
  @Input() job: any
  @Input() statusOptions: { id: number, status: string }[]
  @Input() boxOptions: { id: number, name: string }[]
  @Input() estimatorOptions: any[]
  @Input() columnId: columnIds
  @Output('deleted') jobDeleted = new EventEmitter<number>()
  mailTo: string
  selectedStatus: { id: number, status: string }
  selectedBox: { id: number, name: string }
  assignedTo: { id: number, name: string }
  noBidStatus: number
  isEstimatingCol: boolean
  isBiddingCol: boolean
  isAwardedCol: boolean
  isDev: boolean = false;
  constructor(
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {
  }

  ngOnInit(): void {
    this.isDev = location.hostname == 'localhost'
    this.mailTo = this.job.contactEmail + "?subject=" + encodeURIComponent(this.job.projectName)
    this.selectedStatus = this.statusOptions.find(option => option.id == this.job.statusId)
    this.selectedBox = this.boxOptions.find(option => option.id == this.job.box)
    this.assignedTo = this.estimatorOptions.find(estimator => estimator.id == this.job.assignedTo)
    this.noBidStatus = this.job.noBid
    this.isEstimatingCol = this.columnId == columnIds.ESTIMATING
    this.isBiddingCol = this.columnId == columnIds.INVITATION
    this.isAwardedCol = this.columnId == columnIds.AWARDED

  }

  onStatusChanged(value: MatSelectChange) {
    const responseMessage = "Status updated"
    this.job.statusId = value.value.id
    const partialPayload = {
      statusId: value.value.id,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes
    }
    this.saveTransaction(partialPayload, responseMessage)
  }

  onSaveNote() {
    const responseMessage = "Notes updated"
    const partialPayload = {
      statusId: this.job.statusId,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes
    }
    this.saveTransaction(partialPayload, responseMessage)
  }

  onNoBid(event: MatSlideToggleChange) {
    this.job.noBid = +event.checked
    this.updateBid('noBid', "No Bid status updated")
  }

  onBoxChanged(value: MatSelectChange) {
    this.job.box = value.value.id
    this.updateTransaction('box', "Box updated")
  }

  onAssignedToChanged(value: MatSelectChange) {
    const responseMessage = `${value.value.name} assigned to ${this.job.projectName}`
    const partialPayload = {
      statusId: this.job.statusId,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes,
      assignedTo: value.value.id
    }
    this.saveTransaction(partialPayload, responseMessage)
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
        }).afterClosed().subscribe(estimateCountChange => {
          if (estimateCountChange)
            this.store.dispatch(DashboardActions.requery())
        })
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


  onViewFileList() {
    this.backendService.getData("job_files", { jobId: this.job.jobId })
      .subscribe((resp: AttachedFile[]) => {
        this.dialog.open(FileListComponent, {
          width: '800px',
          data: { job: this.job, fileList: resp }
        }).afterClosed().subscribe(fileCountChanged => {
          if (fileCountChanged)
            this.store.dispatch(DashboardActions.requery())
        })
      })
  }

  onDelete() {
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent).onAction().pipe(
      switchMap(() => {
        return this.backendService.updateData("job_isActive", {
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

  onDiscount() {
    this.dialog.open(AwardDiscountComponent, {
      width: "400px",
      data: this.job
    }).afterClosed().pipe(
      switchMap((resp: { amount: number, note: string }) => {
        return resp
          ? this.backendService.saveData("job_final_cost", {
            jobId: this.job.jobId,
            amount: resp.amount,
            note: resp.note
          })
          : of(null)
      })
    )
      .subscribe(
        resp => {
          if (resp)
            showSnackbar(this.snackBar, `Final Price set for ${this.job.projectName}`)
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


  saveTransaction(partialPayload: { statusId: number, box: number, notes: string, assignedTo?: number }, responseMessage) {
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

  updateBid(key: string, responseMessage: string) {
    this.backendService.updateData('bid_invites', {
      set: { [key]: this.job[key] },
      where: { jobId: this.job.jobId }
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
}
