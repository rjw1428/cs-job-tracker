import { ActionReducerMap, ActionReducer, MetaReducer } from '@ngrx/store';
import { routerReducer } from "@ngrx/router-store";
import { environment } from 'src/environments/environment';
import { AppState } from './models/app';
import { DashboardState } from './models/dashboard';

export interface State {
    router: any,
    app: AppState,
    dashboard: DashboardState,
}

export const reducers: ActionReducerMap<any> = {
    router: routerReducer,
};

// Custom metaReducer, runs before reducer is triggered
export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
    return (state, action) => {
        console.log("PRE STATE", state)
        console.log("ACTION", action)
        return reducer(state, action)
    }
}

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];