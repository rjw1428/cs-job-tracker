import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-estimate-assignment',
  templateUrl: './estimate-assignment.component.html',
  styleUrls: ['./estimate-assignment.component.scss']
})
export class EstimateAssignmentComponent implements OnInit {
  selectedBox: number
  selectedEstimator: any
  constructor(
    private dialogRef: MatDialogRef<EstimateAssignmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: any, estimators: any, boxOptions: number}
    ) { }

  ngOnInit(): void {
  }

  onSave() {
    this.dialogRef.close({boxId: this.selectedBox, estimatorId: this.selectedEstimator})
  }

  onCancel() {
    this.dialogRef.close()
  }

}
