import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClaimantServiceService {
  constructor(private http: HttpClient) {}

  postClaimantsData(claimantsData: any): Observable<any> {
    //const url = `https://securetls.transperfect.com/Relativity.REST/api/tlsclassaction-management/v1/tlsclassaction-service/addupdateclaimaint?caseartifactid=65670504`;

    //const url = 'http://localhost:5001/api?caseartifactid=1019952'

    const url =
      'https://blooming-shelf-00530-667d2fff78d6.herokuapp.com/api?caseartifactid=65670504';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(url, claimantsData, { headers });
  }

  getResponseFromRel(res: any) {}
}
