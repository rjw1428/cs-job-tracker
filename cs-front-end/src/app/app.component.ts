import { Component } from '@angular/core';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { AppActions } from './app.action-types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sidebarWidth: number = 75
  constructor(
    private store: Store<AppState>
  ) {

  }

  ngOnInit() {
    // this.store.dispatch(AppActions.startLoading())
    // this.store.dispatch(AppActions.initApp())
  }
}
