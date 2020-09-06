export class TimeShortcut {
    constructor(
        public id: string,
        public label: string,
        public start: number[] | string,
        public end: number[] | string
    ) {}
}