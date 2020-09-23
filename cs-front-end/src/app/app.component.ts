import { Component } from '@angular/core';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { AppActions } from './app.action-types';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { noop, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sidebarWidth: number = 75
  isDisplayMode$: Observable<boolean>
  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.isDisplayMode$ = this.route.queryParams.pipe(map(params => params['display']))

    this.isDisplayMode$.subscribe(displayMode=>{
      this.sidebarWidth = displayMode ? 0 : this.sidebarWidth
    })
    // this.store.dispatch(AppActions.startLoading())
    this.store.dispatch(AppActions.initApp())
  }
}
