import { Injectable } from '@angular/core';
import { tap, catchError, first, shareReplay, map } from 'rxjs/operators'
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver'
import { Report } from '../reports/reports.component';
import { Chart } from '../charts/charts.component';
import { TimeShortcut } from '../filter/filter.component';
@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  initializeApp() {
    return this.http.get<{reports: Report[], charts: Chart[], timeShortcuts: TimeShortcut[]}>(`${environment.apiUrl}/init/`).pipe(
      shareReplay()
    )
  }
  getData(table: string, params?: {}) {
    const paramString = (params) ? this.convertObjToParma(params) : ""
    return this.http.get<any[]>(`${environment.apiUrl}/api/${table}${paramString}`).pipe(
      shareReplay()
    )
  }

  getChart(storedProcedure: string, time?:{start: number, end: number}) {
    const paramString = (time) ? this.convertObjToParma(time) : ""
    return this.http.get(`${environment.apiUrl}/api/chart/${storedProcedure}${paramString}`).pipe(
      shareReplay()
    )
  }

  getReport(storedProcedure: string, params?:{}) {
    const paramString = (params) ? this.convertObjToParma(params) : ""
    return this.http.get(`${environment.apiUrl}/api/report/${storedProcedure}${paramString}`).pipe(
      shareReplay()
    )
  }

  getSearch(params?:{}) {
    return this.http.get<any[]>(`${environment.apiUrl}/api/search?value=${params}`).pipe(
      shareReplay()
    )
  }

  saveData(table: string, values: any) {
    return this.http.post(`${environment.apiUrl}/api/${table}`, values).pipe(
      shareReplay()
    )
  }

  updateData(table: string, changes: { set: {}, where: {} }) {
    return this.http.post(`${environment.apiUrl}/api/update/${table}`, changes)
  }

  deleteData(table: string, where: {}) {
    return this.http.post(`${environment.apiUrl}/api/delete/${table}`, where)
  }

  sendEmail(message: string) {
    return this.http.post(`${environment.apiUrl}/email`, { message })
  }

  getFile(jobId, fileName, displayId) {
    console.log(displayId)
    this.http.get(`${environment.apiUrl}/download/${jobId}/${fileName}?folder=${displayId}`, { responseType: 'blob' })
      .subscribe((resp: any) => {
        saveAs(resp, decodeURIComponent(fileName))
      })
  }

  sendFile(jobId, file, fileIndex, displayId) {
    const formData: any = new FormData()
    formData.append("document", file, file.fileName);
    const req = new HttpRequest('POST', `${environment.apiUrl}/upload/${jobId}?folder=${displayId}`, formData, {
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
