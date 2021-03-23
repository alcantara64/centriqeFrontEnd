import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseTypeSetupComponent } from './response-type-setup.component';

describe('ResponseTypeSetupComponent', () => {
  let component: ResponseTypeSetupComponent;
  let fixture: ComponentFixture<ResponseTypeSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResponseTypeSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseTypeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
