import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, last } from 'rxjs/operators';
import { Job } from 'src/models/job';
import { Store } from '@ngrx/store';
import { AppState } from 'src/models/appState';
import { fileOptionTypesSelector } from '../dashboard.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  fileTypeSelector$: Observable<string[]>
  fileTypeFormGroup: FormGroup
  constructor(
    private store: Store<AppState>,
    private backendService: BackendService,
    private dialogRef: MatDialogRef<AddFileComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public job: Job
  ) { }

  ngOnInit(): void {
    this.backendService.initAddFileForm()

    this.fileTypeSelector$ = this.store.select(fileOptionTypesSelector)
    this.fileTypeFormGroup = this.formBuilder.group({
      fileType: ["", Validators.required],
      all: [false]
    })
  }

  async onFilesSelected(files: File[]) {
    const jobList = this.fileTypeFormGroup.get('all').value
      ? await this.backendService.getMatchingProjects(this.job.projectId)
      : await new Promise<Job[]>((resolve, reject) => resolve([this.job]))

    jobList.forEach(job => {
      this.uploadFile(files, job)
    })
  }


  uploadFile(files: File[], job: Job) {
    let fileIndex = this.files.length
    for (const item of files) {
      this.files.push(item)
      this.uploadSubscription[fileIndex] = this.backendService
        .sendFile({ jobId: job.jobId, file: item, fileIndex, folder: job.jobDisplayId, subFolder: this.fileTypeFormGroup.get('fileType').value })
        .pipe(
          map((data: any) => {
            return this.getEventMessage(data.response, data.index)
          }),
          last()
        )
        .subscribe((resp: any) => {
          if (job.jobId == this.job.jobId)
            this.backendService.initViewFileForm(this.job)
          this.backendService.saveData('addFiles', job)
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
