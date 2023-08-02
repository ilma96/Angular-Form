import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimantFormComponent } from './claimant-form.component';

describe('ClaimantFormComponent', () => {
  let component: ClaimantFormComponent;
  let fixture: ComponentFixture<ClaimantFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClaimantFormComponent]
    });
    fixture = TestBed.createComponent(ClaimantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
