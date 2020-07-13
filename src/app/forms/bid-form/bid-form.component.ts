import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { Observable, forkJoin, zip } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { startWith, map, switchMap } from 'rxjs/operators';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Bid } from 'src/app/models/bid';
import { filterList, handleFormUpdate } from 'src/app/shared/utility';
import { ContractorFormComponent } from '../contractor-form/contractor-form.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

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
    private dialog: MatDialog,
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
    if (!this.timelineFormGroup.valid)
      return this.error = "Date Added must be in format MM/DD/YYYY"

    const form = {
      contractorId: this.contractorFormGroup.get('contractor').value.contractorId,
      projectId: this.projectFormGroup.get('project').value.projectId,
      dateAdded: this.timelineFormGroup.get('dateAdded').value.toISOString(),
      dateDue: this.timelineFormGroup.get('isAsap').value ? "ASAP" : this.timelineFormGroup.get('dateDue').value.toISOString(),
      bidDateCreated: new Date().toISOString()
    } as Bid

    if (!form.projectId)
      this.onAddProject(this.projectFormGroup.get('project').value)
    if (!form.contractorId)
      this.onAddContractor(this.contractorFormGroup.get('contractor').value)

    if (!form.contractorId || !form.projectId)
      this.error = "Information was missing last time you selected save. Now that the data has been provided, please select save again"
    else
      this.backendService.saveData('bid_invites', form).pipe(
        switchMap(resp => {
          const transaction = {
            jobId: resp['insertId'],
            date: new Date().toISOString(),
            statusId: 11,
            notes: ""
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

  onAddContractor(inputData?: string) {
    const dialogRef = this.dialog.open(ContractorFormComponent, {
      width: '500px',
      data: inputData
    });
    const dialogResp = dialogRef.afterClosed()
    zip(dialogResp, this.contractors$)
      .pipe(
        map(val => {
          if (val[0]) {
            const newEntry = val[0].value
            val[1].push(newEntry)
            return newEntry
          }
        })
      ).subscribe((value: any) => {
        if (value)
          this.contractorFormGroup.patchValue({ contractor: value })
      })
  }

  onAddProject(inputData?: string) {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '350px',
      data: inputData
    });

    const dialogResp = dialogRef.afterClosed()
    zip(dialogResp, this.projects$)
      .pipe(
        map(val => {
          const newEntry = val[0].value
          val[1].push(newEntry)
          return newEntry
        })
      ).subscribe((value: any) => {
        this.projectFormGroup.patchValue({ project: value })
      })
  }

  contractorDisplayFn(contractor): string {
    return contractor && contractor.contractorName ? `${contractor.contractorName} | ${contractor.contactName}` : '';
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
      dateDue: [""],
      isAsap: [false]
    })
  }
}
