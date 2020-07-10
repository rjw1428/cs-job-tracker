import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { Observable, forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { startWith, map, switchMap } from 'rxjs/operators';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { MatDialogRef } from '@angular/material/dialog';
import { Bid } from 'src/app/models/bid';
import { filterList } from 'src/app/shared/utility';

@Component({
  selector: 'app-bid-form',
  templateUrl: './bid-form.component.html',
  styleUrls: ['./bid-form.component.scss']
})
export class BidFormComponent implements OnInit {
  projects$: Observable<any>
  contractors$: Observable<any>
  filteredContractors$: Observable<any>
  filteredProjects$: Observable<any>

  contractorFormGroup: FormGroup
  projectFormGroup: FormGroup
  timelineFormGroup: FormGroup

  error: string = ""
  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<BidFormComponent>,
  ) { }

  ngOnInit(): void {
    this.contractors$ = this.backendService.getData('general_contractors')
    this.projects$ = this.backendService.getData('projects')
    this.initializeFormGroups()
    this.filteredContractors$ = this.contractorFormGroup.get('contractor')
      .valueChanges.pipe(
        startWith(""),
        switchMap(val => {
          return this.contractors$.pipe(
            map(contractors => filterList(val, contractors, "contractorName"))
          )
        })
      )


    this.filteredProjects$ = this.projectFormGroup.get('project')
      .valueChanges.pipe(
        startWith(""),
        switchMap(val => {
          return this.projects$.pipe(
            map(projects => filterList(val, projects, "projectName"))
          )
        })
      )
  }

  onSave() {
    const form = {
      contractorId: this.contractorFormGroup.get('contractor').value.contractorId,
      projectId: this.projectFormGroup.get('project').value.projectId,
      dateAdded: this.timelineFormGroup.get('dateAdded').value.toISOString(),
      dateDue: this.timelineFormGroup.get('isAsap').value ? "ASAP" : this.timelineFormGroup.get('dateDue').value.toISOString(),
      bidDateCreated: new Date().toISOString()
    } as Bid
    this.backendService.saveData('bid_invites', form).pipe(
      switchMap(resp => {
        const transaction = {
          jobId: resp['insertId'],
          date: new Date().toISOString(),
          statusId: 11
        }
        return forkJoin([
          this.backendService.saveData('job_transactions', transaction),
          this.backendService.saveData('job_state', { jobId: resp['insertId'] })
        ])
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
          this.dialogRef.close({ message: "Project Saved", requery: true })
        }
      )
  }

  onNoClick() {
    this.dialogRef.close();
  }

  contractorDisplayFn(contractor): string {
    return contractor && contractor.contractorName ? `${contractor.contractorName} | ${contractor.contactName}`  : '';
  }

  projectDisplayFn(project): string {
    return project && project.projectName ? project.projectName : '';
  }

  initializeFormGroups() {
    this.contractorFormGroup = this.formBuilder.group({
      contractor: ["", Validators.required]
    })

    this.projectFormGroup = this.formBuilder.group({
      project: ["", Validators.required]
    })

    this.timelineFormGroup = this.formBuilder.group({
      dateAdded: ["", Validators.required],
      dateDue: ["", Validators.required],
      isAsap: [false, Validators.required]
    })
  }
}
