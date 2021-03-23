import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAttributesComponent } from './data-attributes.component';

describe('DataAttributesComponent', () => {
  let component: DataAttributesComponent;
  let fixture: ComponentFixture<DataAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataAttributesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
