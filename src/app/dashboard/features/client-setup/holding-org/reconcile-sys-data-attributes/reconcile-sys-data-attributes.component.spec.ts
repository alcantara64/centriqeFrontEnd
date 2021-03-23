import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconcileSysDataAttributesComponent } from './reconcile-sys-data-attributes.component';

describe('ReconcileSysDataAttributesComponent', () => {
  let component: ReconcileSysDataAttributesComponent;
  let fixture: ComponentFixture<ReconcileSysDataAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReconcileSysDataAttributesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconcileSysDataAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
