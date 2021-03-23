import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingOrgSetupComponent } from './holding-org-setup.component';

describe('HoldingOrgSetupComponent', () => {
  let component: HoldingOrgSetupComponent;
  let fixture: ComponentFixture<HoldingOrgSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldingOrgSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingOrgSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
