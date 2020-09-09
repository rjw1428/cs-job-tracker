import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { estimatorsAllSelector } from '../dashboard/dashboard.selectors';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  esitmators$: Observable<any>
  newEstimatorForm: FormGroup
  error = ""
  constructor(
    private backendService: BackendService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<SettingsComponent>,
    private store: Store<AppState>
  ) { }

  ngOnInit() {
    this.newEstimatorForm = this.formBuilder.group({
      name: ["", Validators.required],
      isActive: [1]
    })

    this.esitmators$ = this.store.select(estimatorsAllSelector).pipe(
      map(estimators =>
        estimators.map(estimator => ({
          ...estimator,
          status: estimator['isActive'] ? "Active" : "Deactivated"
        }))
      ))
  }

  onToggleStatus(estimator) {
    this.backendService.saveData('updateEstimator', { ...estimator, isActive: estimator.isActive ? 0 : 1 })
  }

  onNew() {
    const estimator = this.newEstimatorForm.value
    if (!estimator.name) return this.error = "Missing Name"
    this.backendService.saveData('addEstimator', estimator)
  }
}