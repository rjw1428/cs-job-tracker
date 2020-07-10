import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendService } from 'src/app/service/backend.service';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  projectInfoFormGroup: FormGroup
  error: string = ""
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ProjectFormComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.projectInfoFormGroup = this.formBuilder.group({
      projectName: ['', Validators.required],
      city: [''],
      state: [''],
      zip: [''],
    })
  }

  onSave() {
    const form = {
      ...this.projectInfoFormGroup.value,
      projectDateCreated: new Date().toISOString()
    } as Project
    this.backendService.saveData('projects', form)
      .subscribe(resp => {
        console.log(resp)
      },
        err => {
          console.log(err)
          this.error = err.error.error.sqlMessage
        },
        () => this.dialogRef.close({ message: "Project Saved" }))
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
