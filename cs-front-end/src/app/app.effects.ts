import { Injectable } from '@angular/core';
import { AppActions } from './app.action-types';
import { of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BackendService } from './services/backend.service';

@Injectable()
export class AppEffects {
    
    constructor(
        private actions$: Actions,
        private backendService: BackendService
    ) { }
}