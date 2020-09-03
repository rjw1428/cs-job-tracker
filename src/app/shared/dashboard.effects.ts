import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { BackendService } from '../service/backend.service';
import { AppActions } from './app.action-types';
import { throwError, forkJoin, of } from 'rxjs';
import { EventService } from '../service/event.service';
import { DashboardActions } from './dashboard.action-types';

@Injectable()
export class DashboardEffects {

    requery$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.requery),
            tap(() => this.eventService.requery.next())
        ), { dispatch: false })

    constructor(
        private actions$: Actions,
        private backendService: BackendService,
        private eventService: EventService
    ) { }
}