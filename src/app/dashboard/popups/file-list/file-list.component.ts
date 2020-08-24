import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AddFileComponent } from 'src/app/forms/add-file/add-file.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from 'src/app/service/backend.service';
import { noop } from 'rxjs';
import { AttachedFile } from 'src/app/models/attached-file';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from '../confirmation-snackbar/confirmation-snackbar.component';
import { switchMap } from 'rxjs/operators';
import { showSnackbar } from 'src/app/shared/utility';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  displayedColumns = ["open", "fileName", "dateCreated", "remove"];
  sortCol = "dateCreated"
  dataSource: MatTableDataSource<any>
  initialFileCount: number
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private backendService: BackendService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FileListComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { job: any, fileList: AttachedFile[] }
  ) { }

  ngOnInit(): void {
    this.initialFileCount = this.data.fileList.length
    this.dataSource = new MatTableDataSource(this.data.fileList)
    this.dialogRef.beforeClosed().subscribe(() => {
      this.dialogRef.close(this.initialFileCount != this.data.fileList.length)
    })
  }

  onAddFiles() {
    this.dialog.open(AddFileComponent, {
      width: '500px',
      minHeight: '500px',
      height: 'auto',
      data: { ...this.data.job }
    }).afterClosed().subscribe(successCount => {
      //GET NEW ATTACHED FILES FROM LIST INSTEAD OF CLOSING OUT
      this.initialFileCount -= successCount
      this.dialogRef.close()
    })
  }

  getFileLink(file: AttachedFile) {
    this.backendService.getFile(this.data.job.jobId, file.fileName)
  }

  onDelete(file: AttachedFile) {
    this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
      data: { message: `Are you sure you want to delete ${decodeURI(file.fileName)}?`, action: "Delete" }
    }).onAction()
      .pipe(
        switchMap(() => {
          return this.backendService.deleteData("job_files", { fileId: file.fileId }
          )
        })
      )
      .subscribe(
        resp => {
          const matchingFileIndex = this.data.fileList.findIndex(f => f.fileId == file.fileId)
          this.data.fileList.splice(matchingFileIndex, 1)
          this.dataSource = new MatTableDataSource(this.data.fileList)
          showSnackbar(this.snackBar, `File has been removed`)
        },
        err => {
          console.log(err)
          showSnackbar(this.snackBar, err.error.error.sqlMessage)
        }
      )
  }

  onSortChanged() {
    this.sortCol = this.sort.active
    this.dataSource.sort = this.sort
  }
}

