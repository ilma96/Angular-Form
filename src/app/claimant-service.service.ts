import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClaimantServiceService {
  private retryAttempts = 0;
  private maxRetryAttempts = 3;
  private showTryAgainMessage = false;

  constructor(private http: HttpClient, private router: Router) {}

  postClaimantsData(claimantsData: any): Observable<any> {
    //const url = `https://securetls.transperfect.com/Relativity.REST/api/tlsclassaction-management/v1/tlsclassaction-service/addupdateclaimaint?caseartifactid=65670504`;

    //const url = 'http://localhost:5001/api?caseartifactid=1019952'

    const url =
      'https://blooming-shelf-00530-667d2fff78d6.herokuapp.com/api?caseartifactid=65670504';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(url, claimantsData, { headers }).pipe(
      retry(this.maxRetryAttempts), // Retry up to maxRetryAttempts times
      catchError((error) => {
        // Handle errors here
        if (error.status === 200) {
          // If the status code is 200, navigate to the confirmation page
          this.router.navigate(['/confirmation']);
        } else if (this.retryAttempts < this.maxRetryAttempts) {
          this.showTryAgainMessage = true;
          this.retryAttempts++;
        } else {
          this.router.navigate(['/']);
        }
        const err = new Error('Unexpected Error');
        return throwError(() => err);
      })
    );
  }

  showMessage(): boolean {
    return this.showTryAgainMessage;
  }

  resetRetryAttempts() {
    this.retryAttempts = 0;
    this.showTryAgainMessage = false;
  }
}
