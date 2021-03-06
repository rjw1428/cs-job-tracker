import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, State, select } from '@ngrx/store';
import { loadingSelector } from '../app.selectors';
import { AppState } from 'src/models/appState';

@Component({
  selector: 'loading-wrapper',
  templateUrl: './loading-wrapper.component.html',
  styleUrls: ['./loading-wrapper.component.scss']
})
export class LoadingWrapperComponent implements OnInit {
  @Input() loading: boolean
  constructor(
  ) { }

  ngOnInit(): void {
  }

}
