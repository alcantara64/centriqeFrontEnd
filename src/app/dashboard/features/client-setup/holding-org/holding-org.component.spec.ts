import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingOrgComponent } from './holding-org.component';

describe('HoldingOrgComponent', () => {
  let component: HoldingOrgComponent;
  let fixture: ComponentFixture<HoldingOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldingOrgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
