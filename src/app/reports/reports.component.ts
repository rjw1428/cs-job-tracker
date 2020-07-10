import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../service/backend.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  displayedColumns: string[]
  dataSource: any
  dataTableName = "projects_active"
  constructor(
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
    this.backendService.getData(this.dataTableName)
      .subscribe((resp: any[]) => {
        this.displayedColumns = Object.keys(resp[0])
        this.dataSource = new MatTableDataSource(resp);
      })

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
