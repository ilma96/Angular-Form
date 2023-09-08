import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ClaimantFormComponent } from './claimant-form/claimant-form.component';

@Injectable()
export class LinkGuardService {
  constructor(
    private claimantForm: ClaimantFormComponent,
    public router: Router
  ) {}

  canActivate(): boolean {
    if (this.claimantForm.formSubmitted) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}

export const ClaimantFormGuardGuard: CanActivateFn = (route, state) => {
  return inject(LinkGuardService).canActivate();
};
