import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppActions } from '../shared/app.action-types';
import { State } from '../root.reducers';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreatePersonFormComponent } from '../forms/create-person-form/create-person-form.component';
import { showSnackbar, handleFormUpdate } from '../shared/utility';
import { HelpComponent } from '../forms/help/help.component';
import { sidebarWidth, defaultSidebarWidth } from '../shared/app.selectors';
import { environment } from '../../environments/environment'
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
    private store: Store<State>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    this.defaultWidth$ = this.store.pipe(select(defaultSidebarWidth))
    this.width$ = this.store.pipe(select(sidebarWidth))
  }

  onHelp() {
    const dialogRef = this.dialog.open(HelpComponent, {
      width: '500px',
    });
    handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

  onEditEstimators() {
    const dialogRef = this.dialog.open(CreatePersonFormComponent, {
      width: '350px'
    });
    handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

}
