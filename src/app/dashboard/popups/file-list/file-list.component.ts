import { Component, OnInit, Inject } from '@angular/core';
import { AddFileComponent } from 'src/app/forms/add-file/add-file.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from 'src/app/service/backend.service';
import { noop } from 'rxjs';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {

  constructor(
    private backendService: BackendService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FileListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: any, fileList: any[] }
  ) { }

  ngOnInit(): void {
  }

  onAddFiles() {
    this.dialog.open(AddFileComponent, {
      width: '500px',
      data: { ...this.data.job }
    }).afterClosed().subscribe(resp => {
      this.dialogRef.close(resp)
    })
  }

  getFileLink(file) {
    this.backendService.getFile(this.data.job.jobId, file.fileName)
  }
}
