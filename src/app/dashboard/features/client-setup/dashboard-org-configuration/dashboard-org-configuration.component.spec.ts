import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOrgConfigurationComponent } from './dashboard-org-configuration.component';

describe('DashboardOrgConfigurationComponent', () => {
  let component: DashboardOrgConfigurationComponent;
  let fixture: ComponentFixture<DashboardOrgConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardOrgConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOrgConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
