import { Injectable } from '@angular/core';
import { AppActions } from './app.action-types';
import { of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BackendService } from './services/backend.service';
import { ChartsActions } from './sidebar/charts/charts.action-types';
import { first, map, switchMap } from 'rxjs/operators';

@Injectable()
export class AppEffects {
    fetchInitConfigs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.initApp),
            switchMap(() => {
                return this.backendService.initApp()
            }),
            first(),
            switchMap(({ chartConfigs, reportConfigs, rawShortcuts }) => {
                return [
                    AppActions.storeChartConfigs({ chartConfigs }),
                    AppActions.storeReportConfigs({ reportConfigs }),
                    AppActions.storeTimeShortcuts({ rawShortcuts })
                ]
                // return ChartsActions.storeChartConfigs({ chartConfigs })
            })
        )
    )
    constructor(
        private actions$: Actions,
        private backendService: BackendService
    ) { }
}

