import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-award-discount',
  templateUrl: './award-discount.component.html',
  styleUrls: ['./award-discount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AwardDiscountComponent implements OnInit {
  finalCostFormGroup: FormGroup
  error = ""
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AwardDiscountComponent>,
    @Inject(MAT_DIALOG_DATA) public job: any
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
    this.dialogRef.close(this.finalCostFormGroup.value)
  }

  onCancel() {
    this.dialogRef.close()
  }

  getProjectCost() {
    return "0.00"
  }
}
