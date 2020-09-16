import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { JobBoardComponent } from './job-board/job-board.component';
import { JobBoardColumnComponent } from './job-board-column/job-board-column.component';
import { JobBoardItemComponent } from './job-board-item/job-board-item.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { AddContractorComponent } from './add-contractor/add-contractor.component';
import { AddInviteComponent } from './add-invite/add-invite.component';
import { AddEstimateComponent } from './add-estimate/add-estimate.component';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { dashboardReducer } from './dashboard.reducer';
import { SharedModule } from 'src/app/shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { DashboardEffects } from './dashboard.effects';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
]

@NgModule({
  declarations: [
    DashboardComponent,
    JobBoardComponent,
    JobBoardColumnComponent,
    JobBoardItemComponent,
    AddProjectComponent,
    AddContractorComponent,
    AddInviteComponent,
    AddEstimateComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('dashboard', dashboardReducer),
    EffectsModule.forFeature([DashboardEffects]),
  ]
})
export class DashboardModule { }
