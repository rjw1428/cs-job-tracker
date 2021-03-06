import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingWrapperComponent } from '../loading-wrapper/loading-wrapper.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { SingleProposalComponent } from '../single-proposal/single-proposal.component';
import { FilterComponent } from '../filter/filter.component';
import { CustomDateHeaderComponent } from '../filter/custom-date-header/custom-date-header.component';
import { ComboSeriesVerticalComponent, ComboChartComponent } from '../sidebar/charts/combo-chart';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AddFileComponent } from '../sidebar/dashboard/add-file/add-file.component';
import { AddFinalPriceComponent } from '../sidebar/dashboard/add-final-price/add-final-price.component';
import { AssignBidFormComponent } from '../sidebar/dashboard/assign-bid-form/assign-bid-form.component';
import { AwardTimelineFormComponent } from '../sidebar/dashboard/award-timeline-form/award-timeline-form.component';
import { UpdateDueDateComponent } from '../sidebar/dashboard/update-due-date/update-due-date.component';
import { ViewCurrentProposalComponent } from '../sidebar/dashboard/view-current-proposal/view-current-proposal.component';
import { ViewFilesComponent } from '../sidebar/dashboard/view-files/view-files.component';
import { ViewJobHistoryComponent } from '../sidebar/dashboard/view-job-history/view-job-history.component';
import { ViewProposalHistoryComponent } from '../sidebar/dashboard/view-proposal-history/view-proposal-history.component';
import { DecodeURIPipe } from './decode-uri.pipe';
import { DragNDropDirective } from './drag-n-drop.directive';


const modules = [
  CommonModule,
  MatFormFieldModule,
  FormsModule,
  ReactiveFormsModule,
  MatDialogModule,
  MatButtonModule,
  MatInputModule,
  MatDividerModule,
  MatStepperModule,
  MatSnackBarModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatCardModule,
  DragDropModule,
  MatIconModule,
  MatTooltipModule,
  MatSelectModule,
  MatRadioModule,
  MatChipsModule,
  MatExpansionModule,
  MatTableModule,
  MatTabsModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatBadgeModule,
  MatSortModule,
  MatSlideToggleModule,
  MatMenuModule,
  NgxChartsModule
]


@NgModule({
  declarations: [
    LoadingWrapperComponent,
    SingleProposalComponent,
    FilterComponent,
    CustomDateHeaderComponent,
    ComboSeriesVerticalComponent, 
    ComboChartComponent, 

    AddFileComponent,
    ViewFilesComponent,
    DragNDropDirective,
    DecodeURIPipe,
    
    ViewJobHistoryComponent,
    ViewProposalHistoryComponent,
    ViewCurrentProposalComponent,
    AwardTimelineFormComponent,
    AssignBidFormComponent,
    AddFinalPriceComponent,
    UpdateDueDateComponent
  ],
  imports: [modules],
  exports: [
    modules,
    LoadingWrapperComponent,
    SingleProposalComponent,
    FilterComponent,
    CustomDateHeaderComponent,
    ComboSeriesVerticalComponent, 
    ComboChartComponent, 

    AddFileComponent,
    ViewFilesComponent,
    DragNDropDirective,
    DecodeURIPipe,
    
    ViewJobHistoryComponent,
    ViewProposalHistoryComponent,
    ViewCurrentProposalComponent,
    AwardTimelineFormComponent,
    AssignBidFormComponent,
    AddFinalPriceComponent,
    UpdateDueDateComponent
  ]
})
export class SharedModule { }
