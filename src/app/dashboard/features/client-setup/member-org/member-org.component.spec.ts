import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOrgComponent } from './member-org.component';

describe('MemberOrgComponent', () => {
  let component: MemberOrgComponent;
  let fixture: ComponentFixture<MemberOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberOrgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
