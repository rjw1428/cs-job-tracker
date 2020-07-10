import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { ChartsComponent } from './charts.component';


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
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class ChartsModule { }
