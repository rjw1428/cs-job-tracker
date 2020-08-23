import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-award-timeline',
  templateUrl: './award-timeline.component.html',
  styleUrls: ['./award-timeline.component.scss']
})
export class AwardTimelineComponent implements OnInit {
  timelineFormGroup: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AwardTimelineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: any }
  ) { }

  ngOnInit(): void {
    this.timelineFormGroup = this.formBuilder.group({
      startTime: ["", Validators.required],
      endTime: ["", Validators.required]
    })
  }

  onSave() {
    this.dialogRef.close(this.timelineFormGroup.value)
  }

  onCancel() {
    this.dialogRef.close()
  }
}
