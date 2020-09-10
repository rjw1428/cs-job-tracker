import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { DashboardActions } from './dashboard.action-types';
import { AppActions } from '../../app.action-types';
import { BackendService } from '../../services/backend.service';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class DashboardEffects {

    deleteJobEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.deleteJobItem),
            tap(({ job }) => this.backendService.saveData('deleteInvite', job))
        ), { dispatch: false }
    )

    deleteFileEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.deleteFileItem),
            tap(({ file, job }) => this.backendService.saveData('deleteFile', { file, job }))
        ), { dispatch: false }
    )

    toggleNoBid$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.toggleNoBidJobItem),
            tap(({ job }) => this.backendService.saveData('toggleNoBid', job))
        ), { dispatch: false }
    )

    updateBid$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.highlightJobItem),
            tap(({ job }) => this.backendService.saveData('upateBid', job))
        ), { dispatch: false }
    )

    updateJobTransaction$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.updateJobItem),
            tap(({ job }) => this.backendService.saveData('updateJob', job))
        ), { dispatch: false }
    )

    saveManulaSort$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.jobMoved),
            map(action => {
                return {
                    ...action.selectedJob,
                    currentDashboardColumn: action.targetColIndex,
                    previousDashboardColumn: action.sourceColIndex,
                    targetIndexOrder: action.targetOrderIndex
                }
            }),
            tap(job => {
                if (job.currentDashboardColumn != job.previousDashboardColumn)
                    this.backendService.saveData('moveBid', job)
            }),
            catchError(err => throwError(err)),
        ), { dispatch: false }
    )

    constructor(
        private actions$: Actions,
        private backendService: BackendService,
    ) { }
}