import { TestBed } from '@angular/core/testing';

import { ClaimantServiceService } from './claimant-service.service';

describe('ClaimantServiceService', () => {
  let service: ClaimantServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaimantServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
