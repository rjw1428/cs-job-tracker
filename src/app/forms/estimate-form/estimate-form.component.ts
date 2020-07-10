import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, iif, BehaviorSubject, noop, forkJoin } from 'rxjs';
import { BackendService } from 'src/app/service/backend.service';
import { MatDialogRef } from '@angular/material/dialog';
import { map, mergeMap, switchMap, startWith, first, take, tap, shareReplay } from 'rxjs/operators';
import { Estimate } from 'src/app/models/estimate';
import { filterList } from 'src/app/shared/utility';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-estimate-form',
  templateUrl: './estimate-form.component.html',
  styleUrls: ['./estimate-form.component.scss']
})
export class EstimateFormComponent implements OnInit {
  estimateFormGroup: FormGroup
  costFormGroup: FormGroup
  jobFormGroup: FormGroup
  estimators$: Observable<any>
  jobs$: Observable<any>
  filteredEstimators$: Observable<any>
  filteredJobs$: Observable<any>
  projectValue$ = new BehaviorSubject<number>(0)
  projectCost$ = new BehaviorSubject<number>(0)
  selectedJobs = []
  separatorKeysCodes: number[] = [ENTER, COMMA];
  error = ""
  @ViewChild('jobsInput') jobsInput: ElementRef<HTMLInputElement>
  @ViewChild('saveButton') saveButton: MatButton
  readonly estimatorTableName = 'estimators_active'
  readonly jobsTableName = 'projects_ready_for_estimate'
  readonly dataTableName = 'estimates'
  readonly mappingTableName = 'estimates_to_jobs'
  //readonly numericRegex = /\-?\d*\.?\d{1,2}/g

  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EstimateFormComponent>
  ) { }

  ngOnInit(): void {
    this.initializeForms()
    this.estimators$ = this.backendService.getData(this.estimatorTableName)
    this.jobs$ = this.backendService.getData(this.jobsTableName).pipe(
      map((jobs: Object[]) => {
        return jobs.map((job: any, i) => {
          return {
            ...job,
            longName: `${job['contractorName']} ${job['projectName']}`
          }
        })
      })
    )

    // Create filtered estimator list by watching jobs form valueChanges
    this.filteredEstimators$ = this.estimateFormGroup.get('estimatorName')
      .valueChanges.pipe(
        startWith(""),
        switchMap(val => {
          return val
            ? this.estimators$.pipe(
              map(estimators => filterList(val, estimators, "name"))
            )
            : this.estimators$
        })
      )

    // Create filtered jobs list by watching jobs form valueChanges
    this.filteredJobs$ = this.jobFormGroup.get('jobs')
      .valueChanges.pipe(
        startWith(""),
        switchMap(val => {
          return val
            ? this.jobs$.pipe(
              map(jobs => filterList(
                val,
                jobs,
                "longName"
              ))
            )
            : this.jobs$
        })
      )

    // Weird way to set the value as 0 before any valueChanges occur
    this.estimateFormGroup.valueChanges.pipe(
      map(formValues => {
        this.projectCost$.next(
          formValues.fee ? formValues.fee : 0
        )
      })
    ).subscribe(noop)

    // Weird way to set the value as 0 before any valueChanges occur
    this.costFormGroup.valueChanges.pipe(
      map(formValues => {
        this.projectValue$.next(
          Object.values(formValues)
            .reduce((acc: number, curr: number) => acc += curr ? curr : 0, 0) as number
        )
      })
    ).subscribe(noop)
  }

  onSave() {
    const form = {
      ...this.costFormGroup.value,
      estimatorId: this.estimateFormGroup.get('estimatorName').value.id,
      isInHouse: this.estimateFormGroup.get('isInHouse').value,
      fee: this.estimateFormGroup.get('fee').value,
      estimateDateCreated: new Date().toISOString()
    } as Estimate
    this.backendService.saveData(this.dataTableName, form).pipe(
      switchMap(resp => {
        return forkJoin(this.selectedJobs.map(job => {
          const mapping = {
            jobId: job.jobId,
            estimateId: resp['insertId'],
            dateCreated: new Date().toISOString()
          }
          return this.backendService.saveData(this.mappingTableName, mapping)
        }))
      })
    )
      .subscribe(
        resp => {
          console.log(resp)
        },
        err => {
          console.log(err)
          this.error = err.error.error.sqlMessage
        },
        () => {
          this.dialogRef.close({ message: "Estimate Saved", requery: true })
        }
      )
  }

  onAdd(event) {
    console.log(event)
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
    this.estimateFormGroup = this.formBuilder.group({
      estimatorName: ["", Validators.required],
      isInHouse: ["true", Validators.required],
      fee: [""]
    })
    this.costFormGroup = this.formBuilder.group({
      excavationCost: ["", Validators.pattern],
      concreteCost: [""],
      cmuCost: [""],
      brickCost: [""],
      otherCost: [""],
    })
    this.jobFormGroup = this.formBuilder.group({
      jobs: [""]
    })
  }

  estimatorDisplayFn(estimator): string {
    return estimator.name
  }

  jobsDisplayFn(jobs: any[]): string {
    if (jobs.length) {
      const additional = jobs.length > 1 ? `+(${jobs.length - 1} more)` : ""
      return `${jobs[0].projectName} | ${jobs[0].contractorName} ${additional}`
    }
  }
}
