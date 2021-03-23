import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOrgSetupComponent } from './member-org-setup.component';

describe('MemberOrgSetupComponent', () => {
  let component: MemberOrgSetupComponent;
  let fixture: ComponentFixture<MemberOrgSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberOrgSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberOrgSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
