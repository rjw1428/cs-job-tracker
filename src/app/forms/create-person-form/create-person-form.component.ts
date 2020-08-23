import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/service/backend.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-person-form',
  templateUrl: './create-person-form.component.html',
  styleUrls: ['./create-person-form.component.scss']
})
export class CreatePersonFormComponent implements OnInit {
  esitmators$: Observable<any>
  newEstimatorForm: FormGroup
  error = ""
  readonly dataTableName = 'estimators'
  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CreatePersonFormComponent>
  ) { }

  ngOnInit() {
    this.newEstimatorForm = this.formBuilder.group({
      name: ["", Validators.required],
      isActive: [1]
    })

    this.esitmators$ = this.backendService.getData(this.dataTableName)
      .pipe(
        map((resp: any[]) => {
          return resp.map(estimator => {
            return { ...estimator, status: estimator['isActive'] ? "Active" : "Deactivated" }
          })
        })
      )
  }

  onToggleStatus(estimator) {
    const changes = {
      set: { isActive: estimator.isActive ? 0 : 1 },
      where: { id: estimator.id }
    }
    estimator.isActive = estimator.isActive ? 0 : 1
    estimator.status = estimator['isActive'] ? "Active" : "Deactivated"
    this.backendService.updateData(this.dataTableName, changes)
      .subscribe(
        resp => {
          console.log(resp)
        }
      )
  }

  onNew() {
    const estimator = this.newEstimatorForm.value
    if (!estimator.name) return this.error = "Missing Name"
    this.backendService.saveData(this.dataTableName, estimator)
      .subscribe(
        resp => {
          console.log(resp)
        },
        err => {
          console.log(err)
          this.error = err.error.error.sqlMessage
        },
        () => {
          this.dialogRef.close({ message: "Estimator Saved" })
        }
      )
  }
}
