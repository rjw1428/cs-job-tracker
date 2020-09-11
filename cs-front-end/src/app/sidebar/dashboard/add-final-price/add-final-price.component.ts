import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from 'src/models/job';

@Component({
  selector: 'app-add-final-price',
  templateUrl: './add-final-price.component.html',
  styleUrls: ['./add-final-price.component.scss']
})
export class AddFinalPriceComponent implements OnInit {
  finalCostFormGroup: FormGroup
  error = ""
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AddFinalPriceComponent>,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) { }

  ngOnInit(): void {
    this.finalCostFormGroup = this.formBuilder.group({
      amount: ["", Validators.required],
      note: ["", Validators.required]
    })
  }

  onSave() {
    if (!this.finalCostFormGroup.valid)
      return this.error = "Complete form to save."

    this.dialogRef.close({ 
      ...this.finalCostFormGroup.value, 
      jobId: this.job.jobId,
      date: new Date().toLocaleString(),
      proposalId: this.job.proposalId
    })
  }

  onCancel() {
    this.dialogRef.close()
  }

}
