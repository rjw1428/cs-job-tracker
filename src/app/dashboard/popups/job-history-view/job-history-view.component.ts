import { Component, OnInit, ViewChild, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BackendService } from 'src/app/service/backend.service';
import { map } from 'rxjs/operators';
import { EstimateViewComponent } from '../estimate-view/estimate-view.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-job-history-view',
  templateUrl: './job-history-view.component.html',
  styleUrls: ['./job-history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobHistoryViewComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  displayedColumns: string[]
  dataSource: any

  constructor(
    private backendService: BackendService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { transactions: any[], job: any }
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data.transactions)
    this.displayedColumns = Object.keys(this.data.transactions[0]).slice(1, 4)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getTotal() {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = this.convertTimestampToDate(new Date(this.data.transactions[0].date));
    const lastDate = this.convertTimestampToDate(new Date(this.data.transactions[this.data.transactions.length - 1].date));
    return Math.ceil((+lastDate - +firstDate) / oneDay) + 1
  }

  onProposalSelected(element) {
    const proposalId = element.proposalId
    console.log(proposalId)
    this.backendService.getData(environment.proposalSnapshotTableName, { id: proposalId })
      .pipe(
        map(resp => {
          const concreteEstimate = {
            type: "concrete",
            cost: resp[0]['concreteCost'],
            fee: resp[0]['concreteFee'],
            estimator: resp[0]['concreteEstimator'],
            dateCreated: resp[0]['concreteDateCreated'],
          }

          const excavationEstimate = {
            type: "excavation",
            cost: resp[0]['excavationCost'],
            fee: resp[0]['excavationFee'],
            estimator: resp[0]['excavationEstimator'],
            dateCreated: resp[0]['excavationDateCreated'],
          }

          const brickEstimate = {
            type: "brick",
            cost: resp[0]['brickCost'],
            fee: resp[0]['brickFee'],
            estimator: resp[0]['brickEstimator'],
            dateCreated: resp[0]['brickDateCreated'],
          }

          const cmuEstimate = {
            type: "cmu",
            cost: resp[0]['cmuCost'],
            fee: resp[0]['cmuFee'],
            estimator: resp[0]['cmuEstimator'],
            dateCreated: resp[0]['cmuDateCreated'],
          }

          const otherEstimate = {
            type: "other",
            cost: resp[0]['otherCost'],
            fee: resp[0]['otherFee'],
            estimator: resp[0]['otherEstimator'],
            dateCreated: resp[0]['otherDateCreated'],
          }
          return [concreteEstimate, excavationEstimate, brickEstimate, cmuEstimate, otherEstimate]
        }),
      ).subscribe(resp => {
        this.dialog.open(EstimateViewComponent, {
          width: '700px',
          data: { estimates: resp, job: this.data.job }
        });
      })
  }

  convertTimestampToDate(timestamp: Date) {
    const year = timestamp.getFullYear()
    const month = timestamp.getMonth()
    const date = timestamp.getDate()
    return new Date(year, month, date)
  }
}
