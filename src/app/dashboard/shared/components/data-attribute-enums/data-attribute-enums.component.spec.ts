import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAttributeEnumsComponent } from './data-attribute-enums.component';

describe('DataAttributeEnumsComponent', () => {
  let component: DataAttributeEnumsComponent;
  let fixture: ComponentFixture<DataAttributeEnumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataAttributeEnumsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAttributeEnumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
