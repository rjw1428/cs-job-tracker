import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Estimate } from 'src/models/estimate';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, forkJoin, throwError } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { filterList } from 'src/app/shared/utility';
import { TitleCasePipe } from '@angular/common';
import { EstimateType } from 'src/models/estimateType';
import { Estimator } from 'src/models/estimator';
import { Job } from 'src/models/job';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { estimateTypesSelector, estimatorsSelector, itemsSelector } from '../dashboard.selectors';

@Component({
  selector: 'app-add-estimate',
  templateUrl: './add-estimate.component.html',
  styleUrls: ['./add-estimate.component.scss']
})
export class AddEstimateComponent implements OnInit {
  costFormGroup: FormGroup
  jobFormGroup: FormGroup
  estimateTypes$: Observable<EstimateType[]>
  estimators$: Observable<Estimator[]>
  jobs$: Observable<Job[]>
  filteredEstimators$: Observable<Estimator[]>
  filteredJobs$: Observable<Job[]>
  selectedJobs: Job[] = []
  separatorKeysCodes: number[] = [ENTER, COMMA];
  error = ""
  @ViewChild('jobsInput') jobsInput: ElementRef<HTMLInputElement>
  @ViewChild('saveButton') saveButton: MatButton

  //readonly numericRegex = /\-?\d*\.?\d{1,2}/g

  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private dialogRef: MatDialogRef<AddEstimateComponent>
  ) { }

  ngOnInit(): void {
    this.initializeForms()
    this.backendService.initEstimateForm()
    this.estimateTypes$ = this.store.select(estimateTypesSelector)
    this.estimators$ = this.store.select(estimatorsSelector)
    this.jobs$ = this.store.select(itemsSelector, { columnId: 'estimating' })

    // Create filtered estimator list by watching jobs form valueChanges
    this.filteredEstimators$ = this.costFormGroup.get('estimator')
      .valueChanges.pipe(
        startWith(""),
        switchMap(val => {
          return val
            ? this.estimators$.pipe(map(estimators => filterList(val, estimators, "name") as Estimator[]))
            : this.estimators$
        })
      )

    // Create filtered jobs list by watching jobs form valueChanges
    this.filteredJobs$ = this.jobFormGroup.get('jobs')
      .valueChanges.pipe(
        startWith(""),
        switchMap(val => {
          return val
            ? this.jobs$.pipe(map(jobs => filterList(val, jobs, "longName") as Job[]))
            : this.jobs$
        })
      )
  }

  onSave() {
    if (!this.costFormGroup.valid)
      return this.error = "Information missing from Proposal Type section"
    if (!this.jobFormGroup.valid)
      return this.error = "Must select at least one job to assign the estimate to"
    const estimate = {
      cost: this.costFormGroup.get('cost').value,
      estimateTypeId: this.costFormGroup.get('estimateType').value.id,
      estimatorId: this.costFormGroup.get('estimator').value.id,
      isInHouse: this.costFormGroup.get('isInHouse').value ? 1 : 0,
      fee: this.costFormGroup.get('fee').value ? this.costFormGroup.get('fee').value : 0,
      estimateDateCreated: new Date().toISOString()
    }
    this.dialogRef.close({
      estimate,
      jobIds: this.selectedJobs.map(job => job.jobId)
    })
  }

  onOptionSelect(job: any) {
    this.selectedJobs.push(job)
    this.jobsInput.nativeElement.value = ""
    this.saveButton.focus()
  }

  onRemoveJob(index: number) {
    this.selectedJobs.splice(index, 1)
  }

  initializeForms() {
    this.costFormGroup = this.formBuilder.group({
      estimateType: ["", Validators.required],
      cost: ["", Validators.required],
      estimator: ["", Validators.required],
      isInHouse: ["true", Validators.required],
      fee: [""]
    })
    this.jobFormGroup = this.formBuilder.group({
      jobs: ["", Validators.required]
    })
  }

  estimatorDisplayFn(estimator): string {
    return estimator.name
  }

  estimateTypeDisplayFn(estimateType): string {
    const titlePipe = new TitleCasePipe()
    return titlePipe.transform(estimateType.type)
  }

  jobsDisplayFn(jobs: any[]): string {
    if (jobs.length) {
      const additional = jobs.length > 1 ? `+(${jobs.length - 1} more)` : ""
      return `${jobs[0].projectName} | ${jobs[0].contractorName} ${additional}`
    }
  }
}
