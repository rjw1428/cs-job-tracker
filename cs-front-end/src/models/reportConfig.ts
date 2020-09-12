import { MatTableDataSource } from '@angular/material/table';

export class ReportConfig {
    constructor(
        public id: string,
        public name: string,
        public storedProcedure: string,
        public order: number,
        public excludedTimes: string[] = [],
        public defaultTime: string,
        public footer?: string,
        public displayedColumns?: string[],
        public dataSource?: MatTableDataSource<any[]>
    ) { }
}

