import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, iif, BehaviorSubject, noop, forkJoin, throwError } from 'rxjs';
import { BackendService } from 'src/app/service/backend.service';
import { MatDialogRef } from '@angular/material/dialog';
import { map, mergeMap, switchMap, startWith, first, take, tap, shareReplay, catchError } from 'rxjs/operators';
import { Estimate } from 'src/app/models/estimate';
import { filterList } from 'src/app/shared/utility';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatButton } from '@angular/material/button';
import { TitleCasePipe } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-estimate-form',
  templateUrl: './estimate-form.component.html',
  styleUrls: ['./estimate-form.component.scss']
})
export class EstimateFormComponent implements OnInit {
  costFormGroup: FormGroup
  jobFormGroup: FormGroup
  estimators$: Observable<any>
  jobs$: Observable<any>
  filteredEstimators$: Observable<any>
  filteredJobs$: Observable<any>
  estimateTypes$: Observable<any>
  projectValue$ = new BehaviorSubject<number>(0)
  projectCost$ = new BehaviorSubject<number>(0)
  selectedJobs = []
  separatorKeysCodes: number[] = [ENTER, COMMA];
  error = ""
  @ViewChild('jobsInput') jobsInput: ElementRef<HTMLInputElement>
  @ViewChild('saveButton') saveButton: MatButton

  //readonly numericRegex = /\-?\d*\.?\d{1,2}/g

  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EstimateFormComponent>
  ) { }

  ngOnInit(): void {
    this.initializeForms()
    this.estimators$ = this.backendService.getData(environment.estimatorTableName).pipe(
      map((estimators: { id: number, name: string }[]) => estimators.sort((a, b) => a.name.localeCompare(b.name)))
    )
    this.estimateTypes$ = this.backendService.getData(environment.proposalTypesTableName)
    this.jobs$ = this.backendService.getData(environment.jobsTableName).pipe(
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
    this.filteredEstimators$ = this.costFormGroup.get('estimator')
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
    // this.estimateFormGroup.valueChanges.pipe(
    //   map(formValues => {
    //     this.projectCost$.next(
    //       formValues.fee ? formValues.fee : 0
    //     )
    //   })
    // ).subscribe(noop)

    // Weird way to set the value as 0 before any valueChanges occur
    // this.costFormGroup.valueChanges.pipe(
    //   map(formValues => {
    //     this.projectValue$.next(
    //       Object.values(formValues)
    //         .reduce((acc: number, curr: number) => acc += curr ? curr : 0, 0) as number
    //     )
    //   })
    // ).subscribe(noop)
  }

  onSave() {
    if (!this.costFormGroup.valid)
      return this.error = "Information missing from Proposal Type section"
    if (!this.jobFormGroup.valid)
      return this.error = "Must select at least one job to assign the estimate to"
    const form = {
      cost: this.costFormGroup.get('cost').value,
      estimateTypeId: this.costFormGroup.get('estimateType').value.id,
      estimatorId: this.costFormGroup.get('estimator').value.id,
      isInHouse: this.costFormGroup.get('isInHouse').value,
      fee: this.costFormGroup.get('fee').value,
      estimateDateCreated: new Date().toISOString()
    }
    this.backendService.saveData(environment.dataTableName, form).pipe(
      // Save table mapping
      switchMap(resp => {
        return forkJoin(this.selectedJobs.map(job => {
          const mapping = {
            jobId: job.jobId,
            estimateId: resp['insertId'],
            dateCreated: new Date().toISOString()
          }
          return this.backendService.saveData(environment.mappingTableName, mapping)
        }))
      }),
      catchError(err => throwError(err)),
      // Save previous transaction end date
      switchMap(resp => {
        return forkJoin(this.selectedJobs.map(job => {
          console.log(job)
          return this.backendService.updateData(environment.transactionTableName, {
            set: { dateEnded: new Date().toISOString() },
            where: { id: job.transactionId }
          })
        }))
      }),
      // Save job transaction
      switchMap(resp => {
        return forkJoin(this.selectedJobs.map(job => {
          const mapping = {
            jobId: job.jobId,
            statusId: job.statusId,
            box: job.box,
            assignedTo: job.assignedTo,
            notes: job.notes,
            historyOnlyNotes: `${this.costFormGroup.get('estimateType').value.type} estimate added`,
            date: new Date().toISOString()
          }
          return this.backendService.saveData(environment.transactionTableName, mapping)
        }))
      }),
      catchError(err => throwError(err))
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
