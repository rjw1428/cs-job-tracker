import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { BackendService } from '../service/backend.service';
import { AppActions } from './app.action-types';
import { throwError, forkJoin, of } from 'rxjs';
import { EventService } from '../service/event.service';

@Injectable()
export class AppEffects {

    initializeApp$ = createEffect(() => this.actions$.pipe(
        ofType(AppActions.initApp),
        mergeMap(() => this.backendService.initializeApp()),
        mergeMap(({ reports, charts, timeShortcuts }) => {
            return of(
                AppActions.setReports({ reports }),
                AppActions.setCharts({ charts }),
                AppActions.setTimeShortcuts({ timeShortcuts })
            )
        })
    ));
    
    constructor(
        private actions$: Actions,
        private backendService: BackendService,
        private eventService: EventService
    ) { }
}