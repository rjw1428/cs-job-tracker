export class AttachedFile {
    constructor(
        public dateCreated: string,
        public fileId: number,
        public fileLocation: string,
        public fileName: string,
        public jobId: number,
        public displayId: string,
        public type: string,
        public isActive: boolean
    ) { }
}