import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesSetupComponent } from './roles-setup.component';

describe('RolesSetupComponent', () => {
  let component: RolesSetupComponent;
  let fixture: ComponentFixture<RolesSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RolesSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
