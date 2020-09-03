import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EstimateFormComponent } from './forms/estimate-form/estimate-form.component';
import { CreatePersonFormComponent } from './forms/create-person-form/create-person-form.component';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from './sidebar/sidebar.component';

import { ChartsComponent } from './charts/charts.component';
import { SearchComponent } from './search/search.component';
import { SharedModule } from './shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './root.reducers';
import { environment } from 'src/environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { appReducer } from './shared/app.reducers';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HelpComponent } from './forms/help/help.component';
import { UpdateDueDateComponent } from './forms/update-due-date/update-due-date.component';
import { AddFileComponent } from './forms/add-file/add-file.component';
import { DragNDropDirective } from './directives/drag-n-drop.directive';
import { EstimateAssignmentComponent } from './dashboard/triggered-forms/estimate-assignment/estimate-assignment.component';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './shared/app.effects';
import { DashboardEffects } from './shared/dashboard.effects';

@NgModule({
  declarations: [
    AppComponent,
    CreatePersonFormComponent,
    EstimateFormComponent,
    SidebarComponent,
    ChartsComponent,
    SearchComponent,
    HelpComponent,
    UpdateDueDateComponent,
    AddFileComponent,
    DragNDropDirective,
    EstimateAssignmentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    SharedModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictActionSerializability: true
      }
    }),
    EffectsModule.forRoot([AppEffects, DashboardEffects]),
    StoreModule.forFeature('app', appReducer),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
