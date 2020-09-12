import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ReportsEffect } from './reports.effects';
import { reportReducer } from './reports.reducer';

export const routes: Routes = [
  {
    path: '',
    component: ReportsComponent
  },
  {
    path: ':reportId',
    component: ReportsComponent
  }
]

@NgModule({
  declarations: [
    ReportsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('reports', reportReducer),
    EffectsModule.forFeature([ReportsEffect]),
  ]
})
export class ReportsModule { }