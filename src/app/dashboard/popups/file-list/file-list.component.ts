import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AddFileComponent } from 'src/app/forms/add-file/add-file.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from 'src/app/service/backend.service';
import { noop } from 'rxjs';
import { AttachedFile } from 'src/app/models/attached-file';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  displayedColumns = ["open", "fileName", "dateCreated", "remove"];
  sortCol = "dateCreated"
  dataSource: MatTableDataSource<any>
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(
    private backendService: BackendService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FileListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: any, fileList: AttachedFile[] }
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data.fileList)
  }

  onAddFiles() {
    this.dialog.open(AddFileComponent, {
      width: '500px',
      minHeight: '500px',
      height: 'auto',
      data: { ...this.data.job }
    }).afterClosed().subscribe(resp => {
      this.dialogRef.close(resp)
    })
  }

  getFileLink(file: AttachedFile) {
    this.backendService.getFile(this.data.job.jobId, file.fileName)
  }

  onDelete(file: AttachedFile) {
    console.log(file.fileId)
  }

  onSortChanged() {
    this.sortCol = this.sort.active
    this.dataSource.sort = this.sort
  }
}

