import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BackendService } from 'src/app/service/backend.service';
import { MatDialogRef } from '@angular/material/dialog';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  helpFormGroup: FormGroup
  error: string
  titleCase = new TitleCasePipe()
  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<HelpComponent>
  ) { }

  ngOnInit(): void {
    this.helpFormGroup = this.formBuilder.group({
      name: ["", Validators.required],
      email: [""],
      phone: [""],
      issue: ["", Validators.required]
    })
  }

  onSubmit() {
    if (!this.helpFormGroup.valid) return this.error = "Information missing"
    const msg = Object.keys(this.helpFormGroup.value).map(key => {
      return `${this.titleCase.transform(key)}: ${this.helpFormGroup.value[key]}`
    }).join('\n')
    this.backendService.sendEmail(msg)
      .subscribe(
        resp => {
          console.log(resp)
          this.dialogRef.close({ message: resp['message'], requery: true })
        },
        err => {
          console.log(err)
          this.error = err.error
        }
      )
  }
}
