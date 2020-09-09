import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-confirmation-snackbar',
  templateUrl: './confirmation-snackbar.component.html',
  styleUrls: ['./confirmation-snackbar.component.scss']
})
export class ConfirmationSnackbarComponent implements OnInit {

  constructor(
    public snackBarRef: MatSnackBarRef<ConfirmationSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: {message: string, action: string}
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
