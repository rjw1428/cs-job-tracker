import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BoxOption } from 'src/models/boxOption';
import { Estimator } from 'src/models/estimator';
import { Store } from '@ngrx/store';
import { estimatorsSelector, boxOptionsSelector } from '../dashboard.selectors';
import { AppState } from 'src/models/appState';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Job } from 'src/models/job';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-assign-bid-form',
  templateUrl: './assign-bid-form.component.html',
  styleUrls: ['./assign-bid-form.component.scss']
})
export class AssignBidFormComponent implements OnInit {
  estimators$: Observable<Estimator[]>
  boxOptions$: Observable<BoxOption[]>
  assignmentFormGroup: FormGroup
  error: string
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AssignBidFormComponent>,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) { }

  ngOnInit(): void {
    this.estimators$ = this.store.select(estimatorsSelector)
    this.boxOptions$ = this.store.select(boxOptionsSelector, { appendId: null })

    this.assignmentFormGroup = this.formBuilder.group({
      assignedTo: ["", Validators.required],
      box: ["", Validators.required]
    })
  }

  onSave() {
    if (!this.assignmentFormGroup.valid)
      return this.error = "Please fill out missing information"

    this.estimators$.pipe(first()).subscribe(estimators => {
      const matchingEstimator = estimators.find(est => est.id == this.assignmentFormGroup.get('assignedTo').value)
      this.dialogRef.close({
        selectedJob: { ...this.job, ...this.assignmentFormGroup.value },
        name: matchingEstimator.name
      })
    })
  }

  onCancel() {
    this.dialogRef.close()
  }
}
