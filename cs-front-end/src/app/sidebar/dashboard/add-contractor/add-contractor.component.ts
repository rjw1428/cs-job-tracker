import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { BackendService } from 'src/app/services/backend.service';
import { Contractor } from 'src/models/contractor';

@Component({
  selector: 'app-add-contractor',
  templateUrl: './add-contractor.component.html',
  styleUrls: ['./add-contractor.component.scss']
})
export class AddContractorComponent implements OnInit, AfterViewInit {
  companyInfoFormGroup: FormGroup;
  contactInfoFormGroup: FormGroup;
  error: string = ""
  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddContractorComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: { name: string, contactName: string, contactNumber: string, contactEmail: string }

  ) { }

  ngOnInit(): void {
    this.companyInfoFormGroup = this.formBuilder.group({
      contractorName: [this.data.name ? this.data.name : "", Validators.required]
    });
    this.contactInfoFormGroup = this.formBuilder.group({
      contactName: [this.data.contactName ? this.data.contactName : "", Validators.required],
      contactEmail: [this.data.contactEmail ? this.data.contactEmail : ""],
      contactNumber: [this.data.contactNumber ? this.data.contactNumber : ""]
    });
  }

  ngAfterViewInit() {
    if (this.data.contactName) {
      this.stepper.selectedIndex = 1
    }
  }

  onSave() {
    const form = {
      ...this.companyInfoFormGroup.value,
      ...this.contactInfoFormGroup.value,
      contractorDateCreated: new Date().toLocaleString()
    } as Contractor
    this.dialogRef.close(form)
  }
}
