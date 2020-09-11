import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, State, select } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppState } from 'src/models/appState';
import { environment } from 'src/environments/environment';
import { HelpComponent } from './help/help.component';
import { switchMap } from 'rxjs/operators';
import { BackendService } from '../services/backend.service';
import { showSnackbar } from '../shared/utility';
import { of } from 'rxjs';
import { SettingsComponent } from './settings-component/settings.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  @Input() width: number
  activeButton: string;
  version = environment.version
  isExpanded: boolean = false
  constructor(
    private router: Router,
    private store: Store<AppState>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
    // this.defaultWidth$ = this.store.pipe(select(defaultSidebarWidth))
    // this.width$ = this.store.pipe(select(sidebarWidth))
  }

  onHelp() {
    const dialogRef = this.dialog.open(HelpComponent, {
      width: '500px',
    }).afterClosed().pipe(
      switchMap(msg => msg ? this.backendService.sendEmail(msg) : of(null))
    )
      .subscribe(
        resp => {
          if (resp && resp['error']) showSnackbar(this.snackBar, resp['error'])
          if (resp) showSnackbar(this.snackBar, resp['message'])
        },
      )
  }

  onSettings() {
    const dialogRef = this.dialog.open(SettingsComponent, {
      width: '350px'
    });
    // handleFormUpdate(dialogRef, this.store, this.snackBar)
  }

}
