import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { AppActions } from '../../app.action-types';
import { BackendService } from '../../services/backend.service';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { ReportActions } from './reports.action-types';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/appState';

@Injectable()
export class ReportsEffect {

    setInitialReport$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReportActions.storeReportConfigs),
            map(() => ReportActions.setSelectedReportById())
        )
    )

    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private backendService: BackendService,
        private eventService: EventService
    ) { }
}