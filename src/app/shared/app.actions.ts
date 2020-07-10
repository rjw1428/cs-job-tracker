import { createAction, props } from '@ngrx/store';

export const toggleSideBar = createAction(
    "[Sidebar Component] Sidebar size changed",
    props<{ expand: boolean }>()
)