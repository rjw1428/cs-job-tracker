import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SearchItemComponent } from '../search/search-item/search-item.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DashboardEffects } from '../dashboard/dashboard.effects';
import { dashboardReducer } from '../dashboard/dashboard.reducer';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent
  }
]

@NgModule({
  declarations: [
    SearchComponent,
    SearchItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('dashboard', dashboardReducer),
    EffectsModule.forFeature([DashboardEffects]),
  ]
})
export class SearchModule { }