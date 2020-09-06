import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './app.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { DashboardEffects } from './dashboard/dashboard.effects';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
