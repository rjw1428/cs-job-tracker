import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
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
import { colorShade, showSnackbar } from 'src/app/shared/utility';
import { map, switchMap, mergeMap, first } from 'rxjs/operators';
import { of, noop, Observable } from 'rxjs';
import { DashboardActions } from '../dashboard.action-types';
import { ConfirmationSnackbarComponent } from 'src/app/popups/confirmation-snackbar/confirmation-snackbar.component';
import { ViewFilesComponent } from '../view-files/view-files.component';
import { BoxOption } from 'src/models/boxOption';
import { boxOptionsSelector, statusOptionsSelector, estimatorsSelector, tileColorSelector } from '../dashboard.selectors';
import { StatusOption } from 'src/models/statusOption';
import { Estimator } from 'src/models/estimator';
import { ViewCurrentProposalComponent } from '../view-current-proposal/view-current-proposal.component';
import { ViewJobHistoryComponent } from '../view-job-history/view-job-history.component';
import { AwardTimelineFormComponent } from '../award-timeline-form/award-timeline-form.component';
import { AddFinalPriceComponent } from '../add-final-price/add-final-price.component';
import { UpdateDueDateComponent } from '../update-due-date/update-due-date.component';
import { ViewProposalHistoryComponent } from '../view-proposal-history/view-proposal-history.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AddContractorComponent } from '../add-contractor/add-contractor.component';

@Component({
  selector: 'app-job-board-item',
  templateUrl: './job-board-item.component.html',
  styleUrls: ['./job-board-item.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobBoardItemComponent implements OnInit {
  @Output('deleted') jobDeleted = new EventEmitter<number>()
  @Input() job: Job

  statusOptions$: Observable<StatusOption[]>
  boxOptions$: Observable<BoxOption[]>
  estimatorOptions$: Observable<Estimator[]>
  tileColor$: Observable<string>
  mailTo: string
  isDev: boolean = false;
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private store: Store<AppState>,
    private backendService: BackendService
  ) {
  }

  ngOnInit(): void {
    this.isDev = !environment.production
    this.mailTo = this.job.contactEmail + "?subject=" + encodeURIComponent(this.job.projectName)
    this.boxOptions$ = this.store.select(boxOptionsSelector)
    this.statusOptions$ = this.store.select(statusOptionsSelector, { columnId: this.job.currentDashboardColumn })
    this.estimatorOptions$ = this.store.select(estimatorsSelector)
    this.tileColor$ = this.store.select(tileColorSelector, { job: this.job })
  }

  onDelete() {
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
      data: { message: `Are you sure you want to delete ${this.job.projectName}?`, action: "Delete" }
    }).onAction().subscribe(
      () => this.store.dispatch(DashboardActions.deleteJobItem({ job: this.job }))
    )
  }

  onEditContact() {
    const dialogRef = this.dialog.open(AddContractorComponent, {
      width: '500px',
      data: { name: this.job.contractorName, contactName: this.job.contactName, contactNumber: this.job.contactNumber, contactEmail: this.job.contactEmail }
    }).afterClosed().pipe(
      first(),
      mergeMap(formResp => {
        if (!formResp) return of(null)
        return this.backendService.saveData('addContractor', formResp)
      }),
    ).subscribe(resp => {
      if (resp) {
        const updatedJob = { ...this.job, contractorId: resp.contractorId }
        this.store.dispatch(DashboardActions.updateJobContact({ job: updatedJob }))
        showSnackbar(this.snackBar, "General Contractor Updated")
      }
      // this.dialogRef.close({ message: "General Contractor Saved", value: { ...form, contractorId: resp['insertId'] } });
    },
      err => {
        console.log(err)
        showSnackbar(this.snackBar, err)
        // this.error = err.error.error.sqlMessage
      },
      () => console.log("COMPLETE")
    )
  }

  onNoBid(event: MatSlideToggleChange) {
    const updatedJob = { ...this.job, isNoBid: !!event.checked }
    this.store.dispatch(DashboardActions.toggleNoBidJobItem({ job: updatedJob }))
    showSnackbar(this.snackBar, `No Bid status updated for ${updatedJob.projectName}`)
  }

  onStatusChanged(value: MatSelectChange) {
    const updatedJob = { ...this.job, statusId: value.value, historyOnlyNotes: this.job.notes }
    this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
    showSnackbar(this.snackBar, `Status Updated for ${updatedJob.projectName}`)
  }

  onAssignedToChanged(value: MatSelectChange) {
    this.store.pipe(first(), map(state => {
      const estimator = state.dashboard.estimators.find(estimator => estimator.id == value.value)
      const updatedJob = { ...this.job, assignedTo: value.value, historyOnlyNotes: `Assigned to ${estimator.name}` }
      this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
      showSnackbar(this.snackBar, `${estimator.name} assigned to ${updatedJob.projectName} `)
    })).subscribe(noop)
  }

  onSaveNote(value: string) {
    const updatedJob = { ...this.job, notes: value, historyOnlyNotes: value }
    this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
    showSnackbar(this.snackBar, `Note Updated`)
  }

  onSaveReportNote(value: string) {
    const updatedJob = { ...this.job, reportOnlyNotes: value, historyOnlyNotes: value }
    this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
    showSnackbar(this.snackBar, `Follow Up Note Updated`)
  }

  onBoxChanged(value: MatSelectChange) {
    this.store.pipe(first(), map(state => {
      const box = state.dashboard.boxOptions.find(box => box.id == value.value)
      const updatedJob = { ...this.job, box: box.id, historyOnlyNotes: `Moved to Box ${box.boxId}` }
      this.store.dispatch(DashboardActions.updateJobItem({ job: updatedJob }))
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
        if (updatedJob)
          this.backendService.saveData('updateDueDate', updatedJob)
      })
  }

  onStartEndDateSelected() {
    this.dialog.open(AwardTimelineFormComponent, {
      width: '500px',
      data: this.job
    }).afterClosed()
      .pipe(
        map(updatedJob => updatedJob ? updatedJob : null)
      )
      .subscribe(updatedJob => {
        if (updatedJob)
          this.backendService.saveData('updateTimeline', updatedJob)
      })
  }

  onDiscount() {
    this.dialog.open(AddFinalPriceComponent, {
      width: '500px',
      data: this.job
    }).afterClosed()
      .subscribe(finalCost => {
        if (finalCost)
          this.backendService.saveData('setFinalCost', { finalCost, job: this.job })
      })
  }

  onProposalHistory() {
    this.store.dispatch(DashboardActions.clearSelectedProposalHistory())
    this.dialog.open(ViewProposalHistoryComponent, {
      width: '700px',
      data: this.job
    });
  }

  onAlert() {
    const updatedJob = { ...this.job, isAlerted: !this.job.isAlerted }
    this.store.dispatch(DashboardActions.highlightJobItem({ job: updatedJob }))
  }

  onTitleClicked() {
    this.store.dispatch(DashboardActions.expandItem({ id: this.job.jobId }))
    if (this.isDev) console.log(this.job)
  }

  setDarkendFooter(color: string) {
    if (color == 'initial') return "whitesmoke"
    return colorShade(color, -20)
  }


}






