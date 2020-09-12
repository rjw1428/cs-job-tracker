import { Component, OnInit, ViewChild, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddFileComponent } from '../add-file/add-file.component';
import { ConfirmationSnackbarComponent } from 'src/app/popups/confirmation-snackbar/confirmation-snackbar.component';
import { switchMap, first, map } from 'rxjs/operators';
import { showSnackbar } from 'src/app/shared/utility';
import { AttachedFile } from 'src/models/attachedFile';
import { AppState } from 'src/models/appState';
import { Store } from '@ngrx/store';
import { selectedJobSelector, selectedJobFilesSelector, formLoadingSelector } from '../dashboard.selectors';
import { Job } from 'src/models/job';
import { Observable, noop } from 'rxjs';
import { DashboardActions } from '../dashboard.action-types';

@Component({
  selector: 'app-view-files',
  templateUrl: './view-files.component.html',
  styleUrls: ['./view-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewFilesComponent implements OnInit {
  displayedColumns = ["open", "fileName", "dateCreated", "remove"];
  sortCol = "dateCreated"
  dataSource: MatTableDataSource<any>
  isLoading$: Observable<boolean>
  fileList$: Observable<AttachedFile[]>
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private backendService: BackendService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewFilesComponent>,
    private snackBar: MatSnackBar,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) { }

  ngOnInit(): void {
    this.backendService.initViewFileForm(this.job)

    this.isLoading$ = this.store.select(formLoadingSelector)
    this.fileList$ = this.store.select(selectedJobFilesSelector)
    this.fileList$.subscribe(fileList => {
      if (fileList)
        this.dataSource = new MatTableDataSource(fileList)
    })
  }

  onAddFiles() {
    this.dialog.open(AddFileComponent, {
      width: '500px',
      minHeight: '500px',
      height: 'auto',
      data: this.job
    })
  }

  getFileLink(file: AttachedFile) {
    this.backendService.getFile(this.job.jobId, file.fileName, file.displayId)
  }

  onDelete(file: AttachedFile) {
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
      data: { message: `Are you sure you want to delete ${decodeURI(file.fileName)}?`, action: "Delete" }
    }).onAction().subscribe(
      () => this.store.dispatch(DashboardActions.deleteFileItem({ file, job: this.job }))
    )
  }

  onSortChanged() {
    this.sortCol = this.sort.active
    this.dataSource.sort = this.sort
  }
}
