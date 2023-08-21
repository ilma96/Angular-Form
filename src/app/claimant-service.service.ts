import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClaimantServiceService {
  private apiURL =
    'http://108.28.15.180/Relativity.REST/api/tlsclassaction-management/v1/tlsclassaction-service';

  constructor(private http: HttpClient) {}

  postClaimantsData(claimantsData: any): Observable<any> {
    const url = `${this.apiURL}/addupdateclaimaint?caseartifactid=1019952`;
    const headers = new HttpHeaders({
      'X-CSRF-Header': '-',
      'Content-Type': 'application/json',
      Authorization:
        'Basic cmVsYXRpdml0eS5hZG1pbkByZWxhdGl2aXR5LmNvbTpUZXN0MTIzNCE=',
    });
    return this.http.post(url, claimantsData, { headers });
  }

  getResponseFromRel(res: any) {}
}
