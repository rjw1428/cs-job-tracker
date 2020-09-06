import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, State, select } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { handleFormUpdate } from '../shared/utility';
import { AppState } from 'src/models/appState';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  defaultWidth$: Observable<number>
  width$: Observable<number>
  activeButton: string;
  version = environment.version
  isExpanded: boolean = false
  constructor(
    private router: Router,
    private store: Store<AppState>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    // this.defaultWidth$ = this.store.pipe(select(defaultSidebarWidth))
    // this.width$ = this.store.pipe(select(sidebarWidth))
  }

  onHelp() {
    // const dialogRef = this.dialog.open(HelpComponent, {
    //   width: '500px',
    // });
    // handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

  onEditEstimators() {
    // const dialogRef = this.dialog.open(CreatePersonFormComponent, {
    //   width: '350px'
    // });
    // handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

}
