import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from './charts.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { chartReducer } from './charts.reducer';
import { ChartEffect } from './charts.effects';
import { EffectsModule } from '@ngrx/effects';

export const routes: Routes = [
  {
    path: '',
    component: ChartsComponent
  },
  {
    path: ':chartId',
    component: ChartsComponent
  }
]


@NgModule({
  declarations: [ChartsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('charts', chartReducer),
    EffectsModule.forFeature([ChartEffect]),
  ]
})
export class ChartsModule { }
