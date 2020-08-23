import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../dashboard/dashboard.component';

import { JobBoardComponent } from '../dashboard/job-board/job-board.component';
import { JobBoardColumnComponent } from '../dashboard/job-board-column/job-board-column.component';
import { JobBoardItemComponent } from '../dashboard/job-board-item/job-board-item.component';

import { BidFormComponent } from '../forms/bid-form/bid-form.component';
import { ContractorFormComponent } from '../forms/contractor-form/contractor-form.component';
import { ProjectFormComponent } from '../forms/project-form/project-form.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { dashboardReducer } from '../shared/dashboard.reducers';
import { ConfirmationSnackbarComponent } from './popups/confirmation-snackbar/confirmation-snackbar.component';
import { EstimateViewComponent } from './popups/estimate-view/estimate-view.component';
import { EstimateHistoryViewComponent } from './popups/estimate-history-view/estimate-history-view.component';
import { JobHistoryViewComponent } from './popups/job-history-view/job-history-view.component';
import { EstimateComponent } from './estimate/estimate.component';
import { FileListComponent } from './popups/file-list/file-list.component';
import { DecodeURIPipe } from '../pipes/decode-uri.pipe';
import { AwardTimelineComponent } from './triggered-forms/award-timeline/award-timeline.component';
import { AwardDiscountComponent } from './triggered-forms/award-discount/award-discount.component';
// import * as PopupModule from '@ui-widgets-js/popup-menu'
export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
]

@NgModule({
  declarations: [
    ContractorFormComponent,
    ProjectFormComponent,
    BidFormComponent,
    JobBoardComponent,
    JobBoardColumnComponent,
    JobBoardItemComponent,
    DashboardComponent,
    ConfirmationSnackbarComponent,
    EstimateViewComponent,
    EstimateHistoryViewComponent,
    JobHistoryViewComponent,
    EstimateComponent,
    FileListComponent,
    DecodeURIPipe,
    AwardTimelineComponent,
    AwardDiscountComponent,
    // PopupModule
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('dashboard', dashboardReducer),
  ]
})
export class DashboardModule { }
