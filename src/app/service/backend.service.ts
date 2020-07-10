import { Injectable } from '@angular/core';
import { tap, catchError, first, shareReplay } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
    return this.http.post(`${environment.apiUrl}/email`, {message})
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
