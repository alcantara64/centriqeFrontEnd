import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgDropdownlistComponent } from './org-dropdownlist.component';

describe('OrgDropdownlistComponent', () => {
  let component: OrgDropdownlistComponent;
  let fixture: ComponentFixture<OrgDropdownlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgDropdownlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgDropdownlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
