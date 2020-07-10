import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

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
  ]
})
export class ReportsModule { }
