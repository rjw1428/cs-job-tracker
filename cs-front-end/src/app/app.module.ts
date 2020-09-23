import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './root.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule } from '@angular/common/http';
import { loadingReducer } from './app.reduce';
import { HelpComponent } from './sidebar/help/help.component';
import { SettingsComponent } from './sidebar/settings-component/settings.component';
import { ConfirmationSnackbarComponent } from './popups/confirmation-snackbar/confirmation-snackbar.component';
import { BackendService } from './services/backend.service';
import { SpecialReportComponent } from './special-report/special-report.component';

export function init(backend: BackendService) {
  return () => backend.setupBackend()
}

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HelpComponent,
    SettingsComponent,
    ConfirmationSnackbarComponent,
    SpecialReportComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictActionSerializability: true
      }
    }),
    StoreModule.forFeature('app', loadingReducer),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
  ],
  providers: [
    BackendService,
    {
      provide: APP_INITIALIZER,
      useFactory: init,
      multi: true,
      deps: [BackendService]
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
