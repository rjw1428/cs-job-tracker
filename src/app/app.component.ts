import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from './models/app';
import { Observable } from 'rxjs/internal/Observable';
import { map, tap } from 'rxjs/operators';
import { State } from './root.reducers';
import { BehaviorSubject, noop } from 'rxjs';
import { loadingSelector } from './shared/app.selectors';
import { AppActions } from './shared/app.action-types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  sidebarWidth: number = 75;
  constructor(
    private store: Store<State>
  ) { 
    this.store.dispatch(AppActions.startLoading())
  }

  ngOnInit() {
    
  }
}
