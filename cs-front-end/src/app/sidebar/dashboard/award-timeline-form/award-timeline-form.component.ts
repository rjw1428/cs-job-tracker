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
    console.log(this.job.startTime)
    this.timelineFormGroup = this.formBuilder.group({
      startTime: [this.job.startTime && this.job.startTime != "TBD" ? new Date(Date.parse(this.job.startTime)) : ""],
      startTBD: [this.job.startTime == "TBD"],
      endTime: [this.job.endTime && this.job.endTime != "TBD" ? new Date(Date.parse(this.job.endTime)) : ""],
      endTBD: [this.job.endTime == "TBD"]
    })
    console.log(this.timelineFormGroup.value)

    this.timelineFormGroup.get('startTime').valueChanges.subscribe(val => {
      if (this.timelineFormGroup.get('startTBD').value)
        if ((typeof val == 'string' && val.length) || (typeof val == 'object'))
          this.timelineFormGroup.get('startTBD').setValue(false)
    })

    this.timelineFormGroup.get('endTime').valueChanges.subscribe(val => {
      if (this.timelineFormGroup.get('endTBD').value)
        if ((typeof val == 'string' && val.length) || (typeof val == 'object'))
          this.timelineFormGroup.get('endTBD').setValue(false)
    })
  }

  onSave() {
    if (!this.timelineFormGroup.get('endTime').value && !this.timelineFormGroup.get('endTBD').value)
      return this.error = "Must enter an end date or mark as TBD"
    else if (!this.timelineFormGroup.get('startTime').value && !this.timelineFormGroup.get('startTBD').value)
      return this.error = "Must enter a start date or mark as TBD"

    this.dialogRef.close({
      ...this.job,
      startTime: this.timelineFormGroup.get('startTBD').value ? "TBD" : this.timelineFormGroup.get('startTime').value.toLocaleString(),
      endTime: this.timelineFormGroup.get('endTBD').value ? "TBD" : this.timelineFormGroup.get('endTime').value.toLocaleString()
    })
  }

  onCancel() {
    this.dialogRef.close()
  }
}
