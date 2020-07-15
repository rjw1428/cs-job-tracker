import { Injectable } from '@angular/core';
import { tap, catchError, first, shareReplay, map } from 'rxjs/operators'
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver'
@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  getData(table: string, params?: {}) {
    const paramString = (params) ? this.convertObjToParma(params) : ""
    return this.http.get(`${environment.apiUrl}/api/${table}${paramString}`).pipe(
      shareReplay()
    )
  }

  saveData(table: string, values: any) {
    return this.http.post(`${environment.apiUrl}/api/${table}`, values)
  }

  updateData(table: string, changes: { set: {}, where: {} }) {
    return this.http.post(`${environment.apiUrl}/api/update/${table}`, changes)
  }

  sendEmail(message: string) {
    return this.http.post(`${environment.apiUrl}/email`, { message })
  }

  getFile(jobId, fileName) {
    this.http.get(`${environment.apiUrl}/download/${jobId}/${fileName}`, { responseType: 'blob' })
      .subscribe((resp: any) => {
        saveAs(resp, decodeURIComponent(fileName))
      })
  }

  sendFile(jobId, file, fileIndex) {
    const formData: any = new FormData()
    formData.append("document", file, file.fileName);
    const req = new HttpRequest('POST', `${environment.apiUrl}/upload/${jobId}`, formData, {
      reportProgress: true
    });
    return this.http.request(req).pipe(map(resp => ({ response: resp, index: fileIndex })))
  }

  convertObjToParma(obj: {}) {
    return "?" + Object.keys(obj).map(key => {
      return `${key}=${encodeURIComponent(
        typeof obj[key] == 'object'
          ? obj[key].join("|")
          : obj[key]
      )}`
    }).join("&")
  }
}
