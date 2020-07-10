import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../service/backend.service';
import { MatDialog } from '@angular/material/dialog';
import { CreatePersonFormComponent } from '../forms/create-person-form/create-person-form.component';
import { ProjectFormComponent } from '../forms/project-form/project-form.component';
import { BidFormComponent } from '../forms/bid-form/bid-form.component';
import { Store } from '@ngrx/store';
import { State } from '../root.reducers';
import { EstimateFormComponent } from '../forms/estimate-form/estimate-form.component';
import { handleFormUpdate, showSnackbar } from '../shared/utility';
import { ContractorFormComponent } from '../forms/contractor-form/contractor-form.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private service: BackendService,
    private store: Store<State>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {

  }

  onCreateContractor() {
    const dialogRef = this.dialog.open(ContractorFormComponent, {
      width: '500px',
    });
    handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

  onCreateProject() {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '350px'
    });
    handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

  onCreateBid() {
    const dialogRef = this.dialog.open(BidFormComponent, {
      width: '400px'
    });
    handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

  onCreateEstimate() {
    const dialogRef = this.dialog.open(EstimateFormComponent, {
      width: '700px'
    });
    handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

  onBoardUpdated(message) {
    showSnackbar(this.snackBar, message)
  }
}
