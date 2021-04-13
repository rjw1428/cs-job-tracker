import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store, State } from '@ngrx/store';
import { AppState } from 'src/models/appState';
import { Job } from 'src/models/job';

@Component({
  selector: 'app-update-due-date',
  templateUrl: './update-due-date.component.html',
  styleUrls: ['./update-due-date.component.scss']
})
export class UpdateDueDateComponent implements OnInit {

  error: string
  dueDateFormGroup: FormGroup
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UpdateDueDateComponent>,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public input: { job: Job, field: string }
  ) { }

  ngOnInit(): void {
    this.dueDateFormGroup = this.formBuilder.group({
      dateDue: [new Date(Date.parse(this.input.job[this.input.field])), Validators.required],
      isAsap: [this.input.job[this.input.field] == 'ASAP', Validators.required]
    })
  }

  onSave() {
    const newDueDate = this.dueDateFormGroup.value.isAsap
      ? 'ASAP'
      : this.dueDateFormGroup.value.dateDue.toLocaleString()
    this.dialogRef.close({ ...this.input.job, [this.input.field]: newDueDate })
  }
}
