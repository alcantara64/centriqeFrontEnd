import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAttributesGroupComponent } from './data-attributes-group.component';

describe('DataAttributesGroupComponent', () => {
  let component: DataAttributesGroupComponent;
  let fixture: ComponentFixture<DataAttributesGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataAttributesGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAttributesGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
