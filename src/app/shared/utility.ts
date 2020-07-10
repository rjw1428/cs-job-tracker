import { DashboardActions } from './dashboard.action-types';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

const snackBarHorizontalPosition: MatSnackBarHorizontalPosition = 'right'
const snackBarVerticalPosition: MatSnackBarVerticalPosition = 'top'
const snackBarDuration: number = 3000

export function showSnackbar(snackBar, message: string) {
    snackBar.open(message, "", {
        duration: snackBarDuration,
        horizontalPosition: snackBarHorizontalPosition,
        verticalPosition: snackBarVerticalPosition,
    })
}

export function handleFormUpdate(dialogRef, store, snackBar) {
    dialogRef.afterClosed().subscribe(result => {
        if (result && result.requery)
            store.dispatch(DashboardActions.requery())

        if (result && result.message)
            showSnackbar(snackBar, result.message)
    });
}

export function filterList(val: string | object, sourceList: Object[], objectKey: string) {
    return val ? sourceList.filter(project => {
        return (typeof val === 'string')?project[objectKey].toLowerCase().indexOf(val.toLowerCase()) != -1:true
    }) : []
}