import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, last } from 'rxjs/operators';
import { Job } from 'src/models/job';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFileComponent implements OnInit {
  files: any[] = []
  uploadSubscription: Subscription[] = []
  percentage: number[] = []
  constructor(
    private backendService: BackendService,
    private dialogRef: MatDialogRef<AddFileComponent>,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) { }

  ngOnInit(): void {
    // this.dialogRef.backdropClick().subscribe(result => {
    //   this.dialogRef.close(this.successCount);
    // });
  }

  onFilesSelected(files: File[]) {
    let fileIndex = this.files.length
    for (const item of files) {
      this.files.push(item)
      this.uploadSubscription[fileIndex] = this.backendService
        .sendFile(this.job.jobId, item, fileIndex, this.job.jobDisplayId)
        .pipe(
          map((data: any) => {
            return this.getEventMessage(data.response, data.index)
          }),
          last()
        )
        .subscribe((resp: any) => {
          this.backendService.initViewFileForm(this.job)
          this.backendService.saveData('addFiles', this.job)
        });
      fileIndex++
    }
  }

  formatBytes(a, b = 2) {
    const endings = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    if (0 === a) return "0 Bytes";
    const c = 0 > b ? 0 : b
    const d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + endings[d]
  }

  cancelUpload(index: number) {
    if (this.uploadSubscription[index]) {
      this.uploadSubscription[index].unsubscribe();
    }
    if (this.percentage[index] != 100)
      this.files.splice(index, 1)
  }

  getEventMessage(event: HttpEvent<any>, i) {
    switch (event.type) {
      case HttpEventType.Sent:
        this.percentage[i] = 0
        break;

      case HttpEventType.UploadProgress:
        const percentDone = Math.round(100 * event.loaded / event.total);
        this.percentage[i] = percentDone
        break;

      case HttpEventType.Response:
        this.percentage[i] = 100;
        if (event.body) {
          return { ...event.body, uploadIndex: i };
        }
    }
  }
}
