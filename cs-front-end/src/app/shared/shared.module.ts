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
// import { LoadingWrapperComponent } from '../loading-wrapper/loading-wrapper.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
// import { FilterComponent } from '../filter/filter.component';
// import { CustomHeaderComponent } from '../filter/custom-header/custom-header.component';
// import { JobBoardItemComponent } from '../dashboard/job-board-item/job-board-item.component';
// import { NgxChartsModule } from '@swimlane/ngx-charts';
// import { ComboSeriesVerticalComponent, ComboChartComponent } from '../charts/combo-chart';


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
  // NgxChartsModule
]


@NgModule({
  declarations: [],
  imports: [modules],
  exports: [modules]
})
export class SharedModule { }
