import { DashboardActions } from '../sidebar/dashboard/dashboard.action-types';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TitleCasePipe } from '@angular/common';
import { RawTimeShortcut } from 'src/models/rawTimeShortcut';
import { TimeShortcut } from 'src/models/timeShortcut';

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

export function filterList(val: string | object, sourceList: Object[], objectKey: string) {
    return !val
        ? []
        : sourceList.filter(project => (typeof val === 'string')
            ? project[objectKey].toLowerCase().indexOf(val.toLowerCase()) != -1
            : true
        )

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

export function sortFn(a, b, key, direction) {
    if (key == 'manual') return 0
    const objA = a[key]
    const objB = b[key]

    return objA > objB
        ? direction == 'asc' ? 1 : -1
        : objA < objB
            ? direction == 'asc' ? -1 : 1
            : 0
}

export const colorShade = (col, amt) => {
    col = col.replace(/^#/, '')
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]

    let [r, g, b] = col.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])

    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)

    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b

    return `#${rr}${gg}${bb}`
}


export const convertRawShortcut = (shortcut: RawTimeShortcut): TimeShortcut => {
    let start = null
    let end = null

    if (shortcut.id == 'all') return { ...shortcut, start: () => null, end: () => null }

    const startFunc = shortcut.start
    if (typeof startFunc == 'string') {
        const terms = startFunc.split("-")
        start = terms.length > 1
            ? (n: Date) => new Date(n.setDate(n.getDate() - +terms[1]))
            : (n: Date) => new Date(n.setDate(n.getDate()))
    }
    else {
        const [year, month, day] = startFunc
        start = () => new Date(year, month, day)
    }
    const endFunc = shortcut.end
    if (typeof endFunc == 'string') {
        const terms = endFunc.split("-")
        end = terms.length > 1
            ? (n: Date) => new Date(n.setDate(n.getDate() - +terms[1]))
            : (n: Date) => new Date(n.setDate(n.getDate()))
    }
    else {
        const [year, month, day] = endFunc
        end = () => new Date(year, month, day)
    }
    return { ...shortcut, start, end }
}


export function formatDate(date) {
    let d = new Date(date)
    let month = (d.getMonth() + 1).toString()
    let day = d.getDate().toString()
    let year = d.getFullYear().toString()
    let hour = d.getHours().toString()
    let min = d.getMinutes().toString()
    let sec = d.getSeconds().toString()

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (min.length < 2) min = '0' + min;
    if (sec.length < 2) sec = '0' + sec;
    return [year, month, day].join('-') + " " + [hour, min, sec].join("");
}


export function formatLengthOfTime(millis) {
    const days = Math.floor(millis / (1000 * 60 * 60 * 24))
    const hours = Math.floor((millis - days * (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((millis - days * (1000 * 60 * 60 * 24) - hours * (1000 * 60 * 60)) / (1000 * 60))

    const f_days = days < 10 ? '0' + days : days.toString()
    const f_hours = hours < 10 ? '0' + hours : hours.toString()
    const f_min = minutes < 10 ? '0' + minutes : minutes.toString()

    return [f_days, f_hours, f_min].join(":")
}

export function isValidDate(d: string): boolean {
    // This would be an ID and not a date
    if (d.includes('-')) return false
    const parts = d.trim().split(' ')
    const test = parts.length > 1
        ? parts.slice(0, -1).join(" ")
        : parts[0]
    return new Date(test).toString() == 'Invalid Date'
        ? false
        : new Date(d).toString() !== 'Invalid Date'
}