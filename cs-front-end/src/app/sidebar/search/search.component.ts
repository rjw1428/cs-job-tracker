import { trigger, state, style, transition, animate } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { fromEvent, noop, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { BackendService } from 'src/app/services/backend.service';
import { showSnackbar } from 'src/app/shared/utility';
import { AppState } from 'src/models/appState';
import { DashboardActions } from '../dashboard/dashboard.action-types';

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
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  searchTerm: string = ''
  sortCol: string = ""
  data: MatTableDataSource<any>
  displayedColumns: string[]
  expandedElement: any
  noData: boolean = false

  data$: Observable<MatTableDataSource<any>>
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchButton') searchButton: MatButton
  @ViewChild('search') searchField: ElementRef

  constructor(
    private backendService: BackendService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.backendService.initSearch()
  }


  async onSearch(searchValue: string) {
    this.noData = false
    let resp = await this.backendService.getSearch(searchValue.replace(/\'/g, "\\\'").trim()) as any[]
    if (!resp.length) return this.noData = true
    this.displayedColumns = Object.keys(resp[0]).filter((key, i) => i)
    this.data = new MatTableDataSource(resp)
    this.data.sort = this.sort
    this.data$ = this.backendService.saveData('search', searchValue.replace(/\'/g, "\\\'").trim()).pipe(
      tap(resp => showSnackbar(this.snackBar, `${resp.length} ${resp.length == 1 ? 'item' : 'items'} found`)),
      map(resp => new MatTableDataSource(resp))
    )
  }

  onSortChanged() {
    this.data.sort = this.sort
  }

  onExpand(job) {
    console.log(job)
  }

}
