import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendService } from 'src/app/services/backend.service';
import { Project } from 'src/models/project';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {
  projectInfoFormGroup: FormGroup
  error: string = ""
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.projectInfoFormGroup = this.formBuilder.group({
      projectName: [this.data ? this.data : "", Validators.required],
      city: [''],
      state: [''],
      zip: [''],
      street:['']
    })
  }

  onSave() {
    const form = {
      ...this.projectInfoFormGroup.value,
      projectDateCreated: new Date().toLocaleString()
    } as Project
    this.dialogRef.close(form)
  }

  onNoClick() {
    this.dialogRef.close();
  }
}

