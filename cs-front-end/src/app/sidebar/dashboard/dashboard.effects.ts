import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { DashboardActions } from './dashboard.action-types';
import { AppActions } from '../../app.action-types';
import { BackendService } from '../../services/backend.service';
import { tap, map, catchError, debounceTime, switchMap } from 'rxjs/operators';
import { forkJoin, of, throwError } from 'rxjs';
import { EventService } from 'src/app/services/event.service';

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
            tap(({ job }) => this.backendService.saveData('updateBid', job))
        ), { dispatch: false }
    )

    updateJobTransaction$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.updateJobItem),
            tap(({ job }) => this.backendService.saveData('updateJob', job))
        ), { dispatch: false }
    )

    updateJobContact$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.updateJobContact),
            tap(({ job }) => this.backendService.saveData('updateContact', job))
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

                if (job.currentDashboardColumn == 'awarded' && job.previousDashboardColumn != "awarded")
                    this.backendService.saveData('awardTimeline', job)
            }),
            catchError(err => throwError(err)),
        ), { dispatch: false }
    )

    triggerMoveForm$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.jobMoveForm),
            tap(() => console.log("CHECKING FOR MOVE FORM")),
            map(action => {
                console.log(action.targetColIndex)
                switch (action.targetColIndex) {
                    case 'estimating':
                        this.eventService.triggerAssignmentFrom.next(action)
                        return { action, openForm: true }

                    case 'proposal':
                        this.eventService.confirmProposal.next(action)
                        return { action, openForm: true }

                    case 'awarded':
                        this.eventService.triggerTimelineForm.next(action)
                        return { action, openForm: true }

                    default:
                        return { action, openForm: false }
                }
            }),
            switchMap(({ action, openForm }) => {
                if (openForm) {
                    return of(DashboardActions.jobMoveIntercepted())
                }
                else {
                    return of(
                        DashboardActions.jobMoved({
                            ...action,
                            selectedJob: {
                                ...action.selectedJob,
                                historyOnlyNotes: `Moved to ${action.targetColIndex}`
                            }
                        }),
                        // DashboardActions.boxCleared({ boxId: action.selectedJob.box })
                    )
                }
            })
        )
    )

    saveBox$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.boxSet),
            map(action => {
                this.backendService.saveData('fillBox', (action))
            })
        ), { dispatch: false }
    )

    // clearBox$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(DashboardActions.boxCleared),
    //         map(action => {
    //             this.backendService.saveData('emptyBox', action.boxId)
    //         })
    //     ), { dispatch: false }
    // )

    changeBox$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.boxChanged),
            map(action => this.backendService.switchBoxes(action.projectId, action.newBox))
        ), { dispatch: false }
    )


    constructor(
        private actions$: Actions,
        private backendService: BackendService,
        private eventService: EventService
    ) { }
}