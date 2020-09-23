import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { AppState } from 'src/models/appState';
import { ReportConfig } from 'src/models/reportConfig';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-special-report',
  templateUrl: './special-report.component.html',
  styleUrls: ['./special-report.component.scss']
})
export class SpecialReportComponent implements OnInit {
  report: ReportConfig
  widths = ['5%', '5%', '25%', '10%', '5%', '5%', '5%', '2%', '5%']
  assignedToColors = {
    'Maria Rodriguez': '#ace7ff',
    'Jeniffer Vidal': '#f1cdb0',
    'Ana Reys': '#F0A35E',
    'Monica Mendes': '#70ae98',
    'Lorena Papapavllo': '#8Ac0De',
    'Jessica Correia': '#F5C9B2',
    'Bidding Enterprise': ''
  }
  fontSize = 24
  constructor(
    private store: Store<AppState>,
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
    this.store.pipe(
      map(state => {
        const reports = state.app.reportConfigs
        return reports.find(reportConfig => reportConfig.id == 'current_estimates')
      }),
      switchMap(report => {
        if (!report) return of(null)
        return this.backendService.fetchData(report.storedProcedure, { start: null, end: null })
          .pipe(map(resp => {
            resp = resp.map(row => ({ ...row, color: row.color 
                ? row.color 
                  : this.assignedToColors[row['Assigned To']] }))
            console.log(resp[0])
            return {
              ...report, dataSource: new MatTableDataSource(resp),
              displayedColumns: Object.keys(resp[0]).slice(0, -1),
            }
          }))
      })
    ).subscribe(report => {
      this.report = report
    })

  }

  grow() {
    this.fontSize += 4
  }

  shrink() {
    this.fontSize -= 4
  }
}
//  ;