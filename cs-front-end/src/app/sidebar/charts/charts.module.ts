import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from './charts.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

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
  ]
})
export class ChartsModule { }
