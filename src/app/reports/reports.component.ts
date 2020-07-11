import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from '../service/backend.service';
import { ActivatedRoute, Params } from '@angular/router';
import { saveAs } from 'file-saver'
import { D } from '@angular/cdk/keycodes';
import { convertJsonToCSV } from '../shared/utility';

export interface Report {
  id: string;
  name: string;
  dataTableName: string;
  displayedColumns?: string[];
  dataSource?: MatTableDataSource<any>
}
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  displayedColumns: string[]
  dataSource: any
  selectedTabOnLoad: number

  reports: Report[] = [{
    id: "active_projects",
    name: "Report 1",
    dataTableName: "projects_active"
  }, {
    id: "estimate_history",
    name: "Report 2",
    dataTableName: "estimates_history"
  }]
  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramsMap: Params) => {
      const selectedReportId = paramsMap.params.reportId
      const matchingIndex = this.reports.findIndex(report => report.id == selectedReportId)
      this.selectedTabOnLoad = matchingIndex == -1 ? 0 : matchingIndex
      this.onTabChanged(this.selectedTabOnLoad)
    })
  }

  onTabChanged(tabNumber: number) {
    const activeReport = this.reports[tabNumber]
    this.updateRouterParams(this.reports[tabNumber].id)
    this.backendService.getData(activeReport.dataTableName)
      .subscribe((resp: any[]) => {
        activeReport.displayedColumns = Object.keys(resp[0])
        activeReport.dataSource = new MatTableDataSource(resp);
      })
  }

  onExport(report) {
    const csvData = convertJsonToCSV(report.dataSource.filteredData)
    const blob = URL.createObjectURL(new Blob([csvData], { type: 'text/csv'}))
    const fileName = report.id + " " + (new Date().toISOString()) + '.csv'
    saveAs(blob, fileName)
  }

  updateRouterParams(reportId) {
    window.history.replaceState({}, '', `/reports/${reportId}`);
  }

  applyFilter(event: Event, dataSource) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }

}
