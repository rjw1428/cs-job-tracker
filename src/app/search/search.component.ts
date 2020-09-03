import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from '../service/backend.service';
import { environment } from 'src/environments/environment';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { AppActions } from '../shared/app.action-types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { State } from '../root.reducers';
import { showSnackbar } from '../shared/utility';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  searchTerm: string = ''
  sortCol: string = ""
  data: MatTableDataSource<any>
  displayedColumns: string[]
  expandedElement: any
  noData: boolean = false
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private backendService: BackendService,
    private store: Store<State>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.store.dispatch(AppActions.stopLoading())
  }


  search() {
    this.noData = false
    this.store.dispatch(AppActions.startLoading())
    this.backendService.getSearch(this.searchTerm.trim())
      .subscribe(
        resp => {
          if (!resp.length) return this.noData = true
          this.displayedColumns = Object.keys(resp[0]).filter((key, i) => i > 0 && i < 8)
          this.data = new MatTableDataSource(resp);
          this.data.sort = this.sort
          showSnackbar(this.snackBar, `${resp.length} ${resp.length == 1 ? 'item' : 'items'} found`)
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error)
          this.store.dispatch(AppActions.stopLoading())
        },
        () => {
          this.store.dispatch(AppActions.stopLoading())
        })
  }

  onSortChanged() {
    this.sortCol = this.sort.active
  }

  onExpand(job) {
  }

  onNoBid(event: MatSlideToggleChange, job: any) {
    job.nonobidStatus = +event.checked
    this.backendService.updateData(environment.jobNoBidTableName, {
      set: { noBid: job.nonobidStatus, date: new Date().toISOString() },
      where: { jobId: job.jobId }
    }).pipe(
      switchMap(resp => {
        return this.backendService.saveData(environment.transactionTableName, {
          jobId: job.jobId,
          date: new Date().toISOString(),
          statusId: job.nonobidStatus ? 1 : 11
        })
      })
    ).subscribe(
      resp => {
        console.log(resp)
      },
      err => {
        console.log(err)
        showSnackbar(this.snackBar, err.error.error.sqlMessage)
      },
      () => showSnackbar(this.snackBar, "No Bid status updated")
    )
  }

}
