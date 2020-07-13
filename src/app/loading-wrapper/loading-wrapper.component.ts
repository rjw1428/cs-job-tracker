import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { State } from '../root.reducers';
import { Store, select } from '@ngrx/store';
import { loadingSelector } from '../shared/app.selectors';

@Component({
  selector: 'loading-wrapper',
  templateUrl: './loading-wrapper.component.html',
  styleUrls: ['./loading-wrapper.component.scss']
})
export class LoadingWrapperComponent implements OnInit {
  loading$: Observable<boolean>
  constructor(
    private store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.loading$ = this.store.pipe(select(loadingSelector))
  }

}
