import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreatePersonFormComponent } from '../create-person-form/create-person-form.component';
import { BackendService } from 'src/app/service/backend.service';
import { Contractor } from 'src/app/models/contractor';

@Component({
  selector: 'app-contractor-form',
  templateUrl: './contractor-form.component.html',
  styleUrls: ['./contractor-form.component.scss']
})
export class ContractorFormComponent implements OnInit {
  companyInfoFormGroup: FormGroup;
  contactInfoFormGroup: FormGroup;
  error: string = ""
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CreatePersonFormComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.companyInfoFormGroup = this.formBuilder.group({
      contractorName: [this.data?this.data:"", Validators.required]
    });
    this.contactInfoFormGroup = this.formBuilder.group({
      contactName: ['', Validators.required],
      contactEmail: [''],
      contactNumber: ['']
    });
  }

  onSave() {
    const form = {
      ...this.companyInfoFormGroup.value,
      ...this.contactInfoFormGroup.value,
      contractorDateCreated: new Date().toISOString()
    } as Contractor
    this.backendService.saveData('general_contractors', form)
      .subscribe(resp => {
        console.log(resp)
        this.dialogRef.close({ message: "General Contractor Saved", value: { ...form, contractorId: resp['insertId'] } });
      },
        err => {
          console.log(err)
          this.error = err.error.error.sqlMessage
        }
      )
  }
}
