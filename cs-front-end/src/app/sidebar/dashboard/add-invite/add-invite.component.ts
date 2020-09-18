import { Component, OnInit } from '@angular/core';
import { Observable, zip, of } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { startWith, switchMap, map, first, mergeMap } from 'rxjs/operators';
import { filterList } from 'src/app/shared/utility';
import { BidInvite } from 'src/models/bidInvite';
import { AddContractorComponent } from '../add-contractor/add-contractor.component';
import { AddProjectComponent } from '../add-project/add-project.component';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { contractorsSelector, projectsSelector } from '../dashboard.selectors';

@Component({
  selector: 'app-add-invite',
  templateUrl: './add-invite.component.html',
  styleUrls: ['./add-invite.component.scss']
})
export class AddInviteComponent implements OnInit {
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
    private dialogRef: MatDialogRef<AddInviteComponent>,
    private dialog: MatDialog,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.backendService.initBidForm()
    this.contractors$ = this.store.select(contractorsSelector)
    this.projects$ = this.store.select(projectsSelector)
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
    if (!this.timelineFormGroup.get('dateDue').value && !this.timelineFormGroup.get('isAsap').value)
      return this.error = "There must be a due date"

    this.attemptToSubmitForm()
  }


  attemptToSubmitForm() {
    const form = {
      contractorId: this.contractorFormGroup.get('contractor').value.contractorId,
      projectId: this.projectFormGroup.get('project').value.projectId,
      dateAdded: this.timelineFormGroup.get('dateAdded').value.toLocaleString(),
      dateDue: this.timelineFormGroup.get('isAsap').value ? "ASAP" : this.timelineFormGroup.get('dateDue').value.toLocaleString(),
      dateCreated: new Date().toLocaleString()
    } as BidInvite

    if (!form.projectId)
      this.onAddProject(this.projectFormGroup.get('project').value)
    else if (!form.contractorId)
      this.onAddContractor(this.contractorFormGroup.get('contractor').value)

    if (form.contractorId && form.projectId)
      this.dialogRef.close(form)
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onAddContractor(inputData?: string) {
    const dialogRef = this.dialog.open(AddContractorComponent, {
      width: '500px',
      data: inputData
    });
    const dialogResp = dialogRef.afterClosed()
      .pipe(
        first(),
        mergeMap(formResp => {
          if (!formResp) return of(null)
          return this.backendService.saveData('addContractor', formResp)
        }),
      ).subscribe(resp => {
        if (resp) {
          console.log(resp)
          this.contractorFormGroup.patchValue({ contractor: resp })
          this.attemptToSubmitForm()
        }
      },
        err => {
          console.log(err)
          this.error = err.error.error.sqlMessage
        },
        () => console.log("COMPLETE")
      )
  }

  onAddProject(inputData?: string) {
    const dialogRef = this.dialog.open(AddProjectComponent, {
      width: '350px',
      data: inputData
    });

    const dialogResp = dialogRef.afterClosed()
      .pipe(
        first(),
        mergeMap(formResp => {
          if (!formResp) return of(null)
          return this.backendService.saveData('addProject', formResp)
        }),
      ).subscribe(resp => {
        if (resp) {
          console.log(resp)
          this.projectFormGroup.patchValue({ project: resp })
          this.attemptToSubmitForm()
        }
      },
        err => {
          console.log(err)
          this.error = err.error.error.sqlMessage
        },
        () => console.log("COMPLETE")
      )
  }

  contractorDisplayFn(contractor): string {
    return contractor && contractor.contractorName ? `${contractor.contractorName} | ${contractor.contactName}` : '';
  }

  projectDisplayFn(project): string {
    return project && project.projectName ? `${project.projectName} | ${project.city}, ${project.state}` : '';
  }

  initializeFormGroups() {
    this.contractorFormGroup = this.formBuilder.group({
      contractor: ["", Validators.required]
    })

    this.projectFormGroup = this.formBuilder.group({
      project: ["", Validators.required]
    })

    this.timelineFormGroup = this.formBuilder.group({
      dateAdded: [new Date(), Validators.required],
      dateDue: [""],
      isAsap: [false]
    })
  }
}
