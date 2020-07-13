import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatSortModule } from '@angular/material/sort';

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
    MatSortModule,
    RouterModule.forChild(routes),
  ]
})
export class ReportsModule { }
