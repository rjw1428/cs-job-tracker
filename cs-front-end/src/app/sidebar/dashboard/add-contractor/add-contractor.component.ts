import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendService } from 'src/app/services/backend.service';
import { Contractor } from 'src/models/contractor';

@Component({
  selector: 'app-add-contractor',
  templateUrl: './add-contractor.component.html',
  styleUrls: ['./add-contractor.component.scss']
})
export class AddContractorComponent implements OnInit {
  companyInfoFormGroup: FormGroup;
  contactInfoFormGroup: FormGroup;
  error: string = ""
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddContractorComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.companyInfoFormGroup = this.formBuilder.group({
      contractorName: [this.data ? this.data : "", Validators.required]
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
      contractorDateCreated: new Date().toLocaleString()
    } as Contractor
    this.dialogRef.close(form)
  }
}
