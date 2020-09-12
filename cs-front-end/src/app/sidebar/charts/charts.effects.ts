import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { AppActions } from '../../app.action-types';
import { BackendService } from '../../services/backend.service';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { ChartsActions } from './charts.action-types';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/appState';

@Injectable()
export class ChartEffect {

    initializeCharts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ChartsActions.initCharts),
            tap(() => this.backendService.initCharts())
        ), { dispatch: false }
    )


    triggerDataFetch$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ChartsActions.setSelectedChartById, ChartsActions.setSelectedChartByIndex),
            tap(() => this.backendService.fetchChartData()),
            map(() => ChartsActions.fetchChartData())
        )
    )

    setInitialChart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ChartsActions.storeChartConfigs),
            map(() => ChartsActions.setSelectedChartById())
        )
    )

    setGanttChart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ChartsActions.addDataToConfig),
            tap(({ config, data }) => {
                if (config.chartType == 'gantt')
                    this.eventService.createGanttChart.next({ ...config, dataSource: data })
            })
        ), { dispatch: false }
    )



    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private backendService: BackendService,
        private eventService: EventService
    ) { }
}