import { Component, OnInit, Inject } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { showSnackbar } from 'src/app/shared/utility';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { State } from 'src/app/root.reducers';
import { DashboardActions } from 'src/app/shared/dashboard.action-types';

@Component({
  selector: 'app-update-due-date',
  templateUrl: './update-due-date.component.html',
  styleUrls: ['./update-due-date.component.scss']
})
export class UpdateDueDateComponent implements OnInit {
  error: string
  dueDateFormGroup: FormGroup
  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateDueDateComponent>,
    private store: Store<State>,
    @Inject(MAT_DIALOG_DATA) public job
  ) { }

  ngOnInit(): void {
    console.log(this.job)
    this.dueDateFormGroup = this.formBuilder.group({
      dateDue: [this.job.dateDue, Validators.required],
      isAsap: [false, Validators.required]
    })
  }

  onSave() {
    const newDueDate = this.dueDateFormGroup.value.isAsap ? 'ASAP' : this.dueDateFormGroup.value.dateDue
    this.job.dateDue = newDueDate
    this.backendService.updateData('bid_invites', {
      set: { dateDue: newDueDate },
      where: { jobId: this.job.jobId }
    }).subscribe(
      resp => {
        console.log(resp)
        this.job.transactionId = resp['insertId']
      },
      err => {
        console.log(err)
        showSnackbar(this.snackBar, err.error.error.sqlMessage)
      },
      () => {
        showSnackbar(this.snackBar, "Due date has been updated")
        this.store.dispatch(DashboardActions.requery())
        this.dialogRef.close()
      }
    )
  }
}
