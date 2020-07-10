import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './models/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sidebarWidth: number = 75;
  constructor(
    private store: Store<AppState>,
  ) { 
    // this.store.subscribe(state=>console.log(state))
  }
}
