import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { BackendService } from '../service/backend.service';
import { AppActions } from './app.action-types';
import { throwError, forkJoin, of } from 'rxjs';

@Injectable()
export class AppEffects {

    initializeApp$ = createEffect(() => this.actions$.pipe(
        ofType(AppActions.initApp),
        mergeMap(() => this.backendService.initializeApp()),
        mergeMap(({reports, charts})=>{
            return of(
                AppActions.setReports({reports}),
                AppActions.setCharts({charts})
            )
        })
    ));

    constructor(
        private actions$: Actions,
        private backendService: BackendService
    ) { }
}