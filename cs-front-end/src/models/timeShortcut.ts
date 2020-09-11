export interface TimeShortcut {
    id: string,
    label: string,
    start: (x: Date) => Date,
    end: (x: Date) => Date
}