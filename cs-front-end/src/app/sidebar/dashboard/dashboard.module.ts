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
import { AddFileComponent } from './add-file/add-file.component';
import { DragNDropDirective } from 'src/app/shared/drag-n-drop.directive';
import { ViewFilesComponent } from './view-files/view-files.component';
import { DecodeURIPipe } from 'src/app/shared/decode-uri.pipe';
import { ViewJobHistoryComponent } from './view-job-history/view-job-history.component';
import { ViewProposalHistoryComponent } from './view-proposal-history/view-proposal-history.component';
import { ViewCurrentProposalComponent } from './view-current-proposal/view-current-proposal.component';
import { AwardTimelineFormComponent } from './award-timeline-form/award-timeline-form.component';
import { AssignBidFormComponent } from './assign-bid-form/assign-bid-form.component';
import { AddFinalPriceComponent } from './add-final-price/add-final-price.component';
import { UpdateDueDateComponent } from './update-due-date/update-due-date.component';

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
    AddFileComponent,
    DragNDropDirective,
    ViewFilesComponent,
    DecodeURIPipe,
    ViewJobHistoryComponent,
    ViewProposalHistoryComponent,
    ViewCurrentProposalComponent,
    AwardTimelineFormComponent,
    AssignBidFormComponent,
    AddFinalPriceComponent,
    UpdateDueDateComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('dashboard', dashboardReducer),
  ]
})
export class DashboardModule { }
