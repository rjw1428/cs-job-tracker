export class Project {
    constructor(
        private projectDateCreated: string,
        private projectName: string,
        private city?: string,
        private state?: string,
        private zip?: string,
        private street?: string
    ) { }
}
