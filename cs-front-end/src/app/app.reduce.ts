import { createReducer, on } from '@ngrx/store'
import { AppActions } from './app.action-types'

export const initialLoadingState: { loading: boolean } = {
    loading: false
}

export const loadingReducer = createReducer(
    initialLoadingState,
    on(AppActions.startLoading, (state) => {
        return { ...state, loading: true }
    }),
    on(AppActions.stopLoading, (state) => {
        return { ...state, loading: false }
    })
)