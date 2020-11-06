import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ReportsEffect } from './reports.effects';
import { reportReducer } from './reports.reducer';
import { OpenButtonComponent } from './open-button/open-button.component';
import { JobItemComponent } from './job-item/job-item.component';

export const routes: Routes = [
  {
    path: '',
    component: ReportsComponent
  },
  {
    path: ':reportId',
    component: ReportsComponent
  },
  {
    path: "**", redirectTo: ''
  },
]

@NgModule({
  declarations: [
    ReportsComponent,
    OpenButtonComponent,
    JobItemComponent
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