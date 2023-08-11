import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClaimantServiceService {
  private apiURL =
    'http://192.168.1.248/Relativity.REST/api/tlsclassaction-management/v1/tlsclassaction-service/addupdateclaimaint?caseartifactid=1019952';

  constructor(private http: HttpClient) {}

  postClaimantsData(claimantsData: any): Observable<any> {
    const url = `${this.apiURL}/<something>`;
    return this.http.post(url, claimantsData);
  }
}
