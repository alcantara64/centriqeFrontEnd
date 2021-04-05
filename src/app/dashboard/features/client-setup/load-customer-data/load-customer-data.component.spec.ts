import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCustomerDataComponent } from './load-customer-data.component';

describe('LoadCustomerDataComponent', () => {
  let component: LoadCustomerDataComponent;
  let fixture: ComponentFixture<LoadCustomerDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadCustomerDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCustomerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
