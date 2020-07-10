import { Component, OnInit } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-confirmation-snackbar',
  templateUrl: './confirmation-snackbar.component.html',
  styleUrls: ['./confirmation-snackbar.component.scss']
})
export class ConfirmationSnackbarComponent implements OnInit {

  constructor(
    public snackBarRef: MatSnackBarRef<ConfirmationSnackbarComponent>,
  ) { }

  ngOnInit(): void {
  }

  doAction() {
    this.snackBarRef.closeWithAction()
  }

  cancel() {
    this.snackBarRef.dismiss()
  }

}
