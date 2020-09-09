import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Job } from 'src/models/job';
import { BackendService } from 'src/app/services/backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/appState';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { environment } from 'src/environments/environment';
import { AppActions } from 'src/app/app.action-types';
import { showSnackbar } from 'src/app/shared/utility';
import { map, switchMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DashboardActions } from '../dashboard.action-types';
import { ConfirmationSnackbarComponent } from 'src/app/popups/confirmation-snackbar/confirmation-snackbar.component';

@Component({
  selector: 'app-job-board-item',
  templateUrl: './job-board-item.component.html',
  styleUrls: ['./job-board-item.component.scss']
})
export class JobBoardItemComponent implements OnInit {
  @Input() job: Job
  @Input() statusOptions: { id: number, status: string }[] = []
  @Input() boxOptions: { id: number, name: string }[] = []
  @Input() estimatorOptions: any[] = []
  @Input() mode: 'search' | 'dashboard' = 'dashboard'
  @Output('deleted') jobDeleted = new EventEmitter<number>()
  mailTo: string
  selectedStatus: { id: number, status: string }
  selectedBox: { id: number, name: string }
  assignedTo: { id: number, name: string }
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
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.isDev = location.hostname == 'localhost'
    this.mailTo = this.job.contactEmail + "?subject=" + encodeURIComponent(this.job.projectName)

    // this.selectedStatus = this.statusOptions.find(option => option.id == this.job.statusId)
    // this.selectedBox = this.boxOptions.find(option => option.id == this.job.box)
    // this.assignedTo = this.estimatorOptions ? this.estimatorOptions.find(estimator => estimator.id == this.job.assignedTo) : null
    // this.isEstimatingCol = this.job.currentDashboardColumn == columnIds.ESTIMATING
    this.isBiddingCol = this.job.currentDashboardColumn == 'invitation'
    // this.isAwardedCol = this.job.currentDashboardColumn == columnIds.AWARDED
    // this.isProposalCol = this.job.currentDashboardColumn == columnIds.PROPOSAL
    // this.isHoldCol = //this.job.currentDashboardColumn == columnIds.HOLD
  }

  onDelete() {
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
      data: { message: `Are you sure you want to delete ${this.job.projectName}?`, action: "Delete" }
    }).onAction().subscribe(
      () => this.store.dispatch(DashboardActions.deleteJobItem({ job: this.job }))
    )
  }

  onNoBid(event: MatSlideToggleChange) {
    const updatedJob = { ...this.job, isNoBid: !!event.checked }
    this.store.dispatch(DashboardActions.toggleNoBidJobItem({ job: updatedJob }))
    showSnackbar(this.snackBar, `No Bid status updated for ${updatedJob.projectName}`)
  }

  onStatusChanged(value: MatSelectChange) {
    // const responseMessage = "Status updated"
    // this.job.statusId = value.value.id
    // const partialPayload = {
    //   statusId: value.value.id,
    //   box: this.job.box ? this.job.box : "",
    //   notes: this.job.notes,
    //   reportOnlyNotes: this.job.reportOnlyNotes
    // }
    // this.saveTransaction(partialPayload, responseMessage)
  }

  onSaveNote() {
    // const responseMessage = "Notes updated"
    // const partialPayload = {
    //   statusId: this.job.statusId,
    //   box: this.job.box ? this.job.box : "",
    //   notes: this.job.notes,
    //   reportOnlyNotes: this.job.reportOnlyNotes
    // }
    // this.saveTransaction(partialPayload, responseMessage)
  }



  onBoxChanged(value: MatSelectChange) {
    // this.job.box = value.value.id
    // this.updateTransaction('box', "Box updated")
  }

  onTitleClicked() {
    if (this.isDev) {
      console.log(this.job)
    }
  }

  onAssignedToChanged(value: MatSelectChange) {
    // const responseMessage = `${value.value.name} assigned to ${this.job.projectName}`
    // const partialPayload = {
    //   statusId: this.job.statusId,
    //   box: this.job.box ? this.job.box : "",
    //   notes: this.job.notes,
    //   assignedTo: value.value.id,
    //   historyOnlyNotes: `Assigned to ${value.value.name}`,
    //   reportOnlyNotes: this.job.reportOnlyNotes
    // }
    // this.saveTransaction(partialPayload, responseMessage)
  }

  onOpenCurrentEstimate() {
    // this.backendService.getData(environment.currentProposalTableName, { jobId: this.job.jobId })
    //   .subscribe(resp => {
    //     this.dialog.open(EstimateViewComponent, {
    //       width: '700px',
    //       data: { estimates: resp, job: this.job, proposalId: this.job.proposalId }
    //     });
    //   })
  }

  onDueDateSelected() {
    // this.dialog.open(UpdateDueDateComponent, {
    //   width: '400px',
    //   data: { ...this.job }
    // }).afterClosed().subscribe(
    //   resp => {
    //     if (resp)
    //       this.job = resp
    //   },
    //   err => console.log(err),
    //   () => {
    //     this.store.dispatch(AppActions.stopLoading())
    //     this.cdr.detectChanges();
    //   })
  }

  onStartEndDateSelected() {
    // this.dialog.open(AwardTimelineComponent, {
    //   width: '350px',
    //   data: { job: this.job }
    // }).afterClosed().subscribe((resp: { startTime: string, endTime: string }) => {
    //   if (resp) {
    //     this.job = {
    //       ...this.job,
    //       ...resp
    //     }
    //     const set = ['startTime', 'endTime'].map(key => ({ [key]: this.job[key] }))
    //       .reduce((acc, cur) => ({ ...acc, ...cur }), {})
    //     this.backendService.updateData(environment.awardTimelineTableName, {
    //       set,
    //       where: { jobId: this.job.jobId }
    //     })
    //       .subscribe(
    //         resp => {
    //           console.log(resp)
    //         },
    //         err => {
    //           console.log(err)
    //           showSnackbar(this.snackBar, err.error.error.sqlMessage)
    //         },
    //         () => {
    //           showSnackbar(this.snackBar, "Timeline updated for" + this.job.projectName)
    //           this.store.dispatch(AppActions.stopLoading())
    //           this.cdr.detectChanges();
    //         }
    //       )
    //   }
    // })
  }

  onProposalHistory() {
    // this.backendService.getData(environment.proposalSnapshotTableName, { jobId: this.job.jobId }).pipe(
    //   map((resps: any[]) => {
    //     return resps.map(resp => {
    //       const concreteEstimate = {
    //         type: "concrete",
    //         cost: resp['concreteCost'],
    //         fee: resp['concreteFee'],
    //         estimator: resp['concreteEstimator'],
    //         dateCreated: resp['concreteDateCreated'],
    //       }

    //       const excavationEstimate = {
    //         type: "excavation",
    //         cost: resp['excavationCost'],
    //         fee: resp['excavationFee'],
    //         estimator: resp['excavationEstimator'],
    //         dateCreated: resp['excavationDateCreated'],
    //       }

    //       const brickEstimate = {
    //         type: "brick",
    //         cost: resp['brickCost'],
    //         fee: resp['brickFee'],
    //         estimator: resp['brickEstimator'],
    //         dateCreated: resp['brickDateCreated'],
    //       }

    //       const cmuEstimate = {
    //         type: "cmu",
    //         cost: resp['cmuCost'],
    //         fee: resp['cmuFee'],
    //         estimator: resp['cmuEstimator'],
    //         dateCreated: resp['cmuDateCreated'],
    //       }
    //       const otherEstimate = {
    //         type: "other",
    //         cost: resp['otherCost'],
    //         fee: resp['otherFee'],
    //         estimator: resp['otherEstimator'],
    //         dateCreated: resp['otherDateCreated'],
    //       }
    //       return {
    //         id: resp['id'],
    //         estimates: [concreteEstimate, excavationEstimate, brickEstimate, cmuEstimate, otherEstimate],
    //         dateSent: resp['dateSent'],
    //         projectValue: resp['project_value'],
    //         outsourceCost: resp['outsource_cost'],
    //         finalCost: resp['finalCost'],
    //         finalCostNote: resp['finalCostNote']
    //       }
    //     })
    //   }),
    //   switchMap((proposalHistory: any[]) => {
    //     if (!this.isEstimatingCol) return of(proposalHistory)
    //     return this.backendService.getData(environment.currentProposalTableName, { jobId: this.job.jobId }).pipe(
    //       map((currentProposals: any[]) => {
    //         const projectValue = currentProposals.map(prop => +prop.cost).reduce((a, b) => a += b, 0)
    //         const outsourceCost = currentProposals.map(prop => +prop.fee).reduce((a, b) => a += b, 0)
    //         return proposalHistory.concat([{ id: -1, estimates: currentProposals, dateSent: "current", projectValue, outsourceCost }])
    //       })
    //     )
    //   })
    // )
    //   .subscribe(resp => {
    //     this.dialog.open(EstimateHistoryViewComponent, {
    //       width: '700px',
    //       data: { proposals: resp, job: this.job }
    //     }).afterClosed().subscribe(estimateCountChange => {
    //       if (estimateCountChange)
    //         this.store.dispatch(DashboardActions.requery())
    //     })
    //   })
  }

  onJobHistory() {
    // this.backendService.getData(environment.jobHistoryTableName, { jobId: this.job.jobId })
    //   .subscribe(resp => {
    //     this.dialog.open(JobHistoryViewComponent, {
    //       width: '700px',
    //       data: { transactions: resp, job: this.job }
    //     });
    //   })
  }


  onViewFileList() {
    // this.backendService.getData(environment.jobFileTableName, { jobId: this.job.jobId })
    //   .subscribe((resp: AttachedFile[]) => {
    //     this.dialog.open(FileListComponent, {
    //       width: '800px',
    //       data: { job: this.job, fileList: resp }
    //     }).afterClosed().subscribe(fileCountChanged => {
    //       if (fileCountChanged)
    //         this.store.dispatch(DashboardActions.requery())
    //     })
    //   })
  }




  onDiscount() {
    // this.dialog.open(AwardDiscountComponent, {
    //   width: "400px",
    //   data: this.job
    // }).afterClosed().pipe(
    //   switchMap((resp: { amount: number, note: string }) => {
    //     return resp
    //       ? this.backendService.saveData(environment.jobFinalCostTableName, {
    //         jobId: this.job.jobId,
    //         amount: resp.amount,
    //         note: resp.note,
    //         proposalId: this.job.proposalId,
    //         date: new Date().toISOString()
    //       })
    //       : of(null)
    //   })
    // )
    //   .subscribe(
    //     resp => {
    //       if (resp) {
    //         showSnackbar(this.snackBar, `Final Price set for ${this.job.projectName}`)
    //         this.store.dispatch(DashboardActions.requery())
    //       }
    //     },
    //     err => {
    //       console.log(err)
    //       showSnackbar(this.snackBar, err.error.error.sqlMessage)
    //     }
    //   )
  }

  updateTransaction(key: string, responseMessage: string) {
    // this.backendService.updateData(environment.transactionTableName, {
    //   set: { [key]: this.job[key] },
    //   where: { id: this.job.transactionId }
    // })
    //   .subscribe(
    //     resp => {
    //       console.log(resp)
    //     },
    //     err => {
    //       console.log(err)
    //       showSnackbar(this.snackBar, err.error.error.sqlMessage)
    //     },
    //     () => showSnackbar(this.snackBar, responseMessage)
    //   )
  }


  saveTransaction(partialPayload: { statusId: number, box?: number, notes?: string, assignedTo?: number }, responseMessage, table?: string) {
    // this.backendService.updateData(environment.transactionTableName, {
    //   set: { dateEnded: new Date().toISOString() },
    //   where: { id: this.job.transactionId }
    // }).pipe(
    //   mergeMap(() => {
    //     return this.backendService.saveData(table ? table : environment.transactionTableName, {
    //       jobId: this.job.jobId,
    //       date: new Date().toISOString(),
    //       ...partialPayload
    //     })
    //   }))
    //   .subscribe(
    //     resp => {
    //       console.log(resp)
    //       this.job.transactionId = resp['insertId']
    //     },
    //     err => {
    //       console.log(err)
    //       showSnackbar(this.snackBar, err.error.error.sqlMessage)
    //     },
    //     () => showSnackbar(this.snackBar, responseMessage)
    //   )
  }

  saveNoBid(responseMessage) {
    //   this.backendService.updateData(environment.jobNoBidTableName, {
    //     set: { noBid: this.job.noBid, date: new Date().toISOString() },
    //     where: { jobId: this.job.jobId }
    //   }).pipe(
    //     switchMap(resp => {
    //       return this.backendService.updateData(environment.transactionTableName, {
    //         set: { dateEnded: new Date().toISOString() },
    //         where: { id: this.job.transactionId }
    //       })
    //     }),
    //     mergeMap(() => {
    //       return this.backendService.saveData(environment.transactionTableName, {
    //         jobId: this.job.jobId,
    //         date: new Date().toISOString(),
    //         statusId: this.job.nonobidStatus ? 1 : 11
    //       })
    //     })
    //   ).subscribe(
    //     resp => {
    //       console.log(resp)
    //     },
    //     err => {
    //       console.log(err)
    //       showSnackbar(this.snackBar, err.error.error.sqlMessage)
    //     },
    //     () => {
    //       showSnackbar(this.snackBar, responseMessage)
    //       this.store.dispatch(AppActions.stopLoading())
    //       this.cdr.detectChanges();
    //     }
    //   )
  }
}
