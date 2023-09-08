import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { claimantFormGuardGuard } from './claimant-form-guard.guard';

describe('claimantFormGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => claimantFormGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
