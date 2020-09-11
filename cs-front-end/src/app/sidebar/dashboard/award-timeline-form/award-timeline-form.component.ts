import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from 'src/models/job';

@Component({
  selector: 'app-award-timeline-form',
  templateUrl: './award-timeline-form.component.html',
  styleUrls: ['./award-timeline-form.component.scss']
})
export class AwardTimelineFormComponent implements OnInit {
  timelineFormGroup: FormGroup
  error: string
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AwardTimelineFormComponent>,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) { }

  ngOnInit(): void {
    this.timelineFormGroup = this.formBuilder.group({
      startTime: [this.job.startTime ? new Date(Date.parse(this.job.startTime)) : "", Validators.required],
      endTime: [this.job.endTime ? new Date(Date.parse(this.job.endTime)) : "", Validators.required]
    })
    console.log(this.timelineFormGroup.value)
  }

  onSave() {
    if (!this.timelineFormGroup.valid)
      return this.error = "Must enter start & end date"

    this.dialogRef.close({
      ...this.job,
      startTime: this.timelineFormGroup.get('startTime').value.toLocaleString(),
      endTime: this.timelineFormGroup.get('endTime').value.toLocaleString()
    })
  }

  onCancel() {
    this.dialogRef.close()
  }
}
