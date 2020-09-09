import { createAction, props } from '@ngrx/store'

export const startLoading = createAction(
    "[Any Component] Start loading"
)

export const stopLoading = createAction(
    "[Any Component] Stop loading"
)

// export const initApp = createAction(
//     "[App Component] Fetch Reports & Charts"
// )