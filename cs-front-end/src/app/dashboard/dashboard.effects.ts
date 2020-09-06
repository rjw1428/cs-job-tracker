import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { DashboardActions } from './dashboard.action-types';
import { AppActions } from '../app.action-types';
import { BackendService } from '../services/backend.service';

@Injectable()
export class DashboardEffects {

    // requery$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(DashboardActions.requery),
    //         tap(() => this.eventService.requery.next()),
    //         map(()=>AppActions.startLoading())
    //     ))

    constructor(
        private actions$: Actions,
        private backendService: BackendService,
    ) { }
}