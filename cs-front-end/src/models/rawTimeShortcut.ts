export class RawTimeShortcut {
    constructor(
        public id: string,
        public label: string,
        public start: number[] | string,
        public end: number[] | string
    ) {}
}