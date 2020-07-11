import { DashboardActions } from './dashboard.action-types';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TitleCasePipe } from '@angular/common';

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
        return (typeof val === 'string') ? project[objectKey].toLowerCase().indexOf(val.toLowerCase()) != -1 : true
    }) : []
}

export function convertJsonToCSV(json: Object[]) {
    const titleCase = new TitleCasePipe()
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(json[0])
    //create csv data table
    const csv = json.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    //Add header
    csv.unshift(header.map(columnName => titleCase.transform(columnName)).join(','))
    return csv.join('\r\n')
}