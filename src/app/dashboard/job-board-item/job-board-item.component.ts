import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from '../popups/confirmation-snackbar/confirmation-snackbar.component';
import { switchMap, map, shareReplay, mergeMap } from 'rxjs/operators';
import { showSnackbar } from 'src/app/shared/utility';
import { MatDialog } from '@angular/material/dialog';
import { EstimateViewComponent } from '../popups/estimate-view/estimate-view.component';
import { EstimateHistoryViewComponent } from '../popups/estimate-history-view/estimate-history-view.component';
import { JobHistoryViewComponent } from '../popups/job-history-view/job-history-view.component';
import { MatSelectChange } from '@angular/material/select';
import { UpdateDueDateComponent } from 'src/app/forms/update-due-date/update-due-date.component';
import { iif, of, noop, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FileListComponent } from '../popups/file-list/file-list.component';
import { AttachedFile } from 'src/app/models/attached-file';
import { AppState } from 'src/app/models/app';
import { Store } from '@ngrx/store';
import { DashboardActions } from 'src/app/shared/dashboard.action-types';
import { columnIds } from 'src/app/models/dashboard-column';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AwardDiscountComponent } from '../triggered-forms/award-discount/award-discount.component';
import { AwardTimelineComponent } from '../triggered-forms/award-timeline/award-timeline.component';

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
  isProposalCol: boolean
  isHoldCol: boolean
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
    this.assignedTo = this.estimatorOptions ? this.estimatorOptions.find(estimator => estimator.id == this.job.assignedTo) : null
    this.noBidStatus = this.job.noBid
    this.isEstimatingCol = this.columnId == columnIds.ESTIMATING
    this.isBiddingCol = this.columnId == columnIds.INVITATION
    this.isAwardedCol = this.columnId == columnIds.AWARDED
    this.isProposalCol = this.columnId == columnIds.PROPOSAL
    this.isHoldCol = this.columnId == columnIds.HOLD
  }

  onStatusChanged(value: MatSelectChange) {
    const responseMessage = "Status updated"
    this.job.statusId = value.value.id
    const partialPayload = {
      statusId: value.value.id,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes,
      reportOnlyNotes: this.job.reportOnlyNotes
    }
    this.saveTransaction(partialPayload, responseMessage)
  }

  onSaveNote() {
    const responseMessage = "Notes updated"
    const partialPayload = {
      statusId: this.job.statusId,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes,
      reportOnlyNotes: this.job.reportOnlyNotes
    }
    this.saveTransaction(partialPayload, responseMessage)
  }

  onNoBid(event: MatSlideToggleChange) {
    this.job.noBid = +event.checked
    this.saveNoBid("No Bid status updated",)
  }

  onBoxChanged(value: MatSelectChange) {
    this.job.box = value.value.id
    this.updateTransaction('box', "Box updated")
  }

  onTitleClicked() {
    if (this.isDev) {
      console.log(this.job)
    }
  }

  onAssignedToChanged(value: MatSelectChange) {
    const responseMessage = `${value.value.name} assigned to ${this.job.projectName}`
    const partialPayload = {
      statusId: this.job.statusId,
      box: this.job.box ? this.job.box : "",
      notes: this.job.notes,
      assignedTo: value.value.id,
      historyOnlyNotes: `Assigned to ${value.value.name}`,
      reportOnlyNotes: this.job.reportOnlyNotes
    }
    this.saveTransaction(partialPayload, responseMessage)
  }

  onOpenCurrentEstimate() {
    this.backendService.getData(environment.currentProposalTableName, { jobId: this.job.jobId })
      .subscribe(resp => {
        this.dialog.open(EstimateViewComponent, {
          width: '700px',
          data: { estimates: resp, job: this.job }
        });
      })
  }

  onDueDateSelected() {
    this.dialog.open(UpdateDueDateComponent, {
      width: '400px',
      data: { ...this.job }
    })
  }

  onStartEndDateSelected() {
    this.dialog.open(AwardTimelineComponent, {
      width: '350px',
      data: { job: this.job }
    }).afterClosed().subscribe((resp: { startTime: string, endTime: string }) => {
      if (resp) {
        this.job = {
          ...this.job,
          ...resp
        }
        const set = ['startTime', 'endTime'].map(key => ({ [key]: this.job[key] }))
          .reduce((acc, cur) => ({ ...acc, ...cur }), {})
        this.backendService.updateData(environment.awardTimelineTableName, {
          set,
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
            () => showSnackbar(this.snackBar, "Timeline updated for" + this.job.projectName)
          )
        this.store.dispatch(DashboardActions.requery())
      }
    })
  }

  onProposalHistory() {
    this.backendService.getData(environment.proposalSnapshotTableName, { jobId: this.job.jobId }).pipe(
      map((resps: any[]) => {
        return resps.map(resp => {
          const concreteEstimate = {
            type: "concrete",
            cost: resp['concreteCost'],
            fee: resp['concreteFee'],
            estimator: resp['concreteEstimator'],
            dateCreated: resp['concreteDateCreated'],
          }

          const excavationEstimate = {
            type: "excavation",
            cost: resp['excavationCost'],
            fee: resp['excavationFee'],
            estimator: resp['excavationEstimator'],
            dateCreated: resp['excavationDateCreated'],
          }

          const brickEstimate = {
            type: "brick",
            cost: resp['brickCost'],
            fee: resp['brickFee'],
            estimator: resp['brickEstimator'],
            dateCreated: resp['brickDateCreated'],
          }

          const cmuEstimate = {
            type: "cmu",
            cost: resp['cmuCost'],
            fee: resp['cmuFee'],
            estimator: resp['cmuEstimator'],
            dateCreated: resp['cmuDateCreated'],
          }
          const otherEstimate = {
            type: "other",
            cost: resp['otherCost'],
            fee: resp['otherFee'],
            estimator: resp['otherEstimator'],
            dateCreated: resp['otherDateCreated'],
          }
          return {
            id: resp['id'],
            estimates: [concreteEstimate, excavationEstimate, brickEstimate, cmuEstimate, otherEstimate],
            dateSent: resp['dateSent'],
            projectValue: resp['project_value'],
            outsourceCost: resp['outsource_cost']
          }
        })
      }),
      switchMap((proposalHistory: any[]) => {
        return this.backendService.getData(environment.currentProposalTableName, { jobId: this.job.jobId }).pipe(
          map((currentProposals: any[]) => {
            const projectValue = currentProposals.map(prop => +prop.cost).reduce((a, b) => a += b, 0)
            const outsourceCost = currentProposals.map(prop => +prop.fee).reduce((a, b) => a += b, 0)
            return proposalHistory.concat([{ id: -1, estimates: currentProposals, dateSent: "current", projectValue, outsourceCost }])
          })
        )
      })
    )
      .subscribe(resp => {
        this.dialog.open(EstimateHistoryViewComponent, {
          width: '700px',
          data: { proposals: resp, job: this.job }
        }).afterClosed().subscribe(estimateCountChange => {
          if (estimateCountChange)
            this.store.dispatch(DashboardActions.requery())
        })
      })
  }

  onJobHistory() {
    this.backendService.getData(environment.jobHistoryTableName, { jobId: this.job.jobId })
      .subscribe(resp => {
        this.dialog.open(JobHistoryViewComponent, {
          width: '700px',
          data: { transactions: resp, job: this.job }
        });
      })
  }


  onViewFileList() {
    this.backendService.getData(environment.jobFileTableName, { jobId: this.job.jobId })
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
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
      data: { message: `Are you sure you want to delete ${this.job.projectName}?`, action: "Delete" }
    }).onAction().pipe(
      switchMap(() => {
        return this.backendService.updateData(environment.jobIsActiveTableName, {
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
          ? this.backendService.saveData(environment.jobFinalCostTableName, {
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
        },
        () => this.store.dispatch(DashboardActions.requery())
      )
  }

  updateTransaction(key: string, responseMessage: string) {
    this.backendService.updateData(environment.transactionTableName, {
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


  saveTransaction(partialPayload: { statusId: number, box?: number, notes?: string, assignedTo?: number }, responseMessage, table?: string) {
    this.backendService.updateData(environment.transactionTableName, {
      set: { dateEnded: new Date().toISOString() },
      where: { id: this.job.transactionId }
    }).pipe(
      mergeMap(() => {
      return this.backendService.saveData(table ? table : environment.transactionTableName, {
        jobId: this.job.jobId,
        date: new Date().toISOString(),
        ...partialPayload
      })
    }))
      .subscribe(
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

  saveNoBid(responseMessage) {
    this.backendService.saveData(environment.jobNoBidTableName, {
      jobId: this.job.jobId,
      noBid: this.job.noBid,
      date: new Date().toISOString()
    }).pipe(
      switchMap(resp => {
        return this.backendService.saveData(environment.transactionTableName, {
          jobId: this.job.jobId,
          date: new Date().toISOString(),
          statusId: 1
        })
      })
    ).subscribe(
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
