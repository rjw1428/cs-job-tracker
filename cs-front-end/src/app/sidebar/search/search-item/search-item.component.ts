import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { noop, Observable, Subject } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { ConfirmationSnackbarComponent } from 'src/app/popups/confirmation-snackbar/confirmation-snackbar.component';
import { BackendService } from 'src/app/services/backend.service';
import { showSnackbar } from 'src/app/shared/utility';
import { AppState } from 'src/models/appState';
import { DashboardColumn } from 'src/models/dashboardColumn';
import { Job } from 'src/models/job';
import { AddFinalPriceComponent } from '../../dashboard/add-final-price/add-final-price.component';
import { AwardTimelineFormComponent } from '../../dashboard/award-timeline-form/award-timeline-form.component';
import { DashboardActions } from '../../dashboard/dashboard.action-types';
import { UpdateDueDateComponent } from '../../dashboard/update-due-date/update-due-date.component';
import { ViewCurrentProposalComponent } from '../../dashboard/view-current-proposal/view-current-proposal.component';
import { ViewFilesComponent } from '../../dashboard/view-files/view-files.component';
import { ViewJobHistoryComponent } from '../../dashboard/view-job-history/view-job-history.component';
import { ViewProposalHistoryComponent } from '../../dashboard/view-proposal-history/view-proposal-history.component';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent implements OnInit {
  @Input() jobId: number
  columns$: Observable<DashboardColumn[]>
  job: Job
  mailTo: string = ""
  updateJob = new Subject()
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private store: Store<AppState>,
    private backendService: BackendService
  ) { }

  ngOnInit() {
    this.backendService.getJob(this.jobId).subscribe(job => {
      this.job = job
      this.mailTo = this.job.contactEmail + "?subject=" + encodeURIComponent(this.job.projectName)
    })

    this.updateJob.pipe(
      switchMap(() => this.backendService.getJob(this.jobId))
    ).subscribe(job =>
      this.job = job
    )

    this.columns$ = this.store.pipe(first(), map(state => state.dashboard.columns))
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
    this.updateJob.next()
    showSnackbar(this.snackBar, `No Bid status updated for ${updatedJob.projectName}`)
  }

  onStatusChanged(value: MatSelectChange) {
    const updatedJob = { ...this.job, statusId: value.value, historyOnlyNotes: this.job.notes }
    this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
    this.updateJob.next()
    showSnackbar(this.snackBar, `Status Updated for ${updatedJob.projectName}`)
  }

  onAssignedToChanged(value: MatSelectChange) {
    this.store.pipe(first(), map(state => {
      const estimator = state.dashboard.estimators.find(estimator => estimator.id == value.value)
      const updatedJob = { ...this.job, assignedTo: value.value, historyOnlyNotes: `Assigned to ${estimator.name}` }
      this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
      this.updateJob.next()
      showSnackbar(this.snackBar, `${estimator.name} assigned to ${updatedJob.projectName} `)
    })).subscribe(noop)
  }

  onSaveNote(value: string) {
    const updatedJob = { ...this.job, notes: value, historyOnlyNotes: value }
    this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
    this.updateJob.next()
    showSnackbar(this.snackBar, `Note Updated`)
  }

  onSaveReportNote(value: string) {
    const updatedJob = { ...this.job, reportOnlyNotes: value, historyOnlyNotes: value }
    this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
    this.updateJob.next()
    showSnackbar(this.snackBar, `Follow Up Note Updated`)
  }

  onBoxChanged(value: MatSelectChange) {
    this.store.pipe(first(), map(state => {
      const box = state.dashboard.boxOptions.find(box => box.id == value.value)
      const updatedJob = { ...this.job, box: box.id, historyOnlyNotes: `Moved to Box ${box.boxId}` }
      this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
      this.updateJob.next()
      showSnackbar(this.snackBar, `Box Updated`)
    })).subscribe(noop)
  }

  onViewFileList() {
    this.store.dispatch(DashboardActions.clearFileList())
    this.dialog.open(ViewFilesComponent, {
      width: '800px',
      data: this.job
    }).afterClosed()
  }

  onOpenCurrentProposal() {
    this.store.dispatch(DashboardActions.clearSelectedProposal())
    this.dialog.open(ViewCurrentProposalComponent, {
      width: '700px',
      data: this.job
    });
  }


  onJobHistory() {
    this.store.dispatch(DashboardActions.clearSelectedJobHistory())
    this.dialog.open(ViewJobHistoryComponent, {
      width: '700px',
      data: this.job
    });
  }

  onDueDateSelected() {
    this.dialog.open(UpdateDueDateComponent, {
      width: '400px',
      data: this.job
    }).afterClosed()
      .subscribe(updatedJob => {
        if (updatedJob) {
          this.backendService.saveData('updateDueDate', updatedJob)
          this.updateJob.next()
        }
      })
  }

  onStartEndDateSelected() {
    this.dialog.open(AwardTimelineFormComponent, {
      width: '500px',
      data: this.job
    }).afterClosed()
      .pipe(map(updatedJob => updatedJob ? updatedJob : null))
      .subscribe(updatedJob => {
        if (updatedJob) {
          this.backendService.saveData('updateTimeline', updatedJob)
          this.updateJob.next()
        }
      })
  }

  onDiscount() {
    this.dialog.open(AddFinalPriceComponent, {
      width: '500px',
      data: this.job
    }).afterClosed()
      .subscribe(finalCost => {
        if (finalCost) {
          this.backendService.saveData('setFinalCost', { finalCost, job: this.job })
          this.updateJob.next()
        }
      })
  }

  onProposalHistory() {
    this.store.dispatch(DashboardActions.clearSelectedProposalHistory())
    this.dialog.open(ViewProposalHistoryComponent, {
      width: '700px',
      data: this.job
    });
  }

  onMove(event: MatSelectChange) {
    // this.store.pipe(first(), map(state => {
    //   const matchingColumn = state.dashboard.columns.find(col => col.id == this.job.currentDashboardColumn)

    //   const sourceColIndex = this.job.currentDashboardColumn
    //   const sourceOrderIndex = matchingColumn.items.findIndex(item => item.jobId == this.job.jobId)
    //   const targetColIndex = event.value
    //   const targetOrderIndex = 0

    //   const selectedJob = this.job
    //   this.store.dispatch(DashboardActions.jobMoveForm({
    //     sourceColIndex,
    //     sourceOrderIndex,
    //     targetColIndex,
    //     targetOrderIndex,
    //     selectedJob
    //   }))
    // })).subscribe(noop)

    const sourceColIndex = this.job.currentDashboardColumn
    const sourceOrderIndex = 0
    const targetColIndex = event.value
    const targetOrderIndex = 0
    const selectedJob = this.job
    this.store.dispatch(DashboardActions.jobMoveForm({
      sourceColIndex,
      sourceOrderIndex,
      targetColIndex,
      targetOrderIndex,
      selectedJob
    }))
  }
}
