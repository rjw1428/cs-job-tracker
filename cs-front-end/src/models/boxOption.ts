export class BoxOption {
    constructor(
        public id: number,
        public boxId: string,
        public isFull: number, //Project Number filling the box
        public jobCount: number //Number of jobs for that project in the box
    ){}
}