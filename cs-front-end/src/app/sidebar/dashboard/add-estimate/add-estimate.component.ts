import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./add-estimate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEstimateComponent implements OnInit {
  costFormGroup: FormGroup[]
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
    private dialogRef: MatDialogRef<AddEstimateComponent>,
  ) { }

  ngOnInit(): void {
    this.initializeForms()
    this.backendService.initEstimateForm()
    this.estimateTypes$ = this.store.select(estimateTypesSelector)
    // .pipe(map(types => {
    //   const selectedValues = this.costFormGroup.map(form => form.get('estimateType').value)
    //   const selectedValueIds = selectedValues.map(val => val.id)
    //   return types.filter(type => !selectedValueIds.includes(type.id))
    // }))
    this.estimators$ = this.store.select(estimatorsSelector)
    this.jobs$ = this.store.select(itemsSelector, { columnId: 'estimating' })

    // Create filtered estimator list by watching jobs form valueChanges
    this.filteredEstimators$ = this.costFormGroup[0].get('estimator')
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
    if (!this.costFormGroup.map(costForm => costForm.value).reduce((acc, cur) => acc && cur, true))
      return this.error = "Information missing from Proposal Type section"
    if (!this.jobFormGroup.valid)
      return this.error = "Must select at least one job to assign the estimate to"

    const estimates = this.costFormGroup.map(form => {
      return {
        [form.get('estimateType').value.id]: {
          cost: form.get('cost').value,
          estimateTypeId: form.get('estimateType').value.id,
          estimatorId: form.get('estimator').value.id,
          isInHouse: form.get('isInHouse').value ? 1 : 0,
          fee: form.get('fee').value ? form.get('fee').value : 0,
          estimateDateCreated: new Date().toLocaleString()
        }
      }
    }).reduce((acc, cur) => {
      const curId = Object.keys(cur)[0]
      const accIds = Object.keys(acc)
      if (!accIds.includes(curId))
        return { ...acc, ...cur }
      return {
        ...acc, [curId]: {
          cost: acc[curId].cost + cur[curId].cost,
          estimateTypeId: cur[curId].estimateTypeId,
          estimatorId: acc[curId].estimatorId,
          isInHouse: (acc[curId].isInHouse || cur[curId].isInHouse) ? 1 : 0,
          fee: acc[curId].fee + cur[curId].fee,
          estimateDateCreated: acc[curId]
        }
      }
    }, {})

    this.dialogRef.close({
      estimates: Object.values(estimates),
      jobs: this.selectedJobs
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

  onAddNewForm(currentFormIndex: number) {
    if (!this.costFormGroup[currentFormIndex].valid)
      return this.error = "Must complete current estimate before you can add another one"
    this.error = ""
    this.costFormGroup.push(this.initializeConstForm())
  }

  onRemoveNewForm(formIndex: number) {
    this.costFormGroup.splice(formIndex, 1)
  }

  initializeForms() {
    this.costFormGroup = [this.initializeConstForm()]
    this.jobFormGroup = this.formBuilder.group({
      jobs: ["", Validators.required]
    })
  }

  initializeConstForm() {
    return this.formBuilder.group({
      estimateType: ["", Validators.required],
      cost: ["", Validators.required],
      estimator: ["", Validators.required],
      isInHouse: ["true", Validators.required],
      fee: [""]
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
