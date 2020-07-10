import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { State } from '../root.reducers';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  sidebarWidth$: Observable<number>;

  constructor(private store: Store<State>) { }

  ngOnInit(): void {
    this.sidebarWidth$ = this.store.pipe(map(state => state.app.sidebarWidth-state.app.defaultSidebarWidth))
  }

}
