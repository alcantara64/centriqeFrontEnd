import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLanchedCampComponent } from './view-launched-camp.component';

describe('ViewLanchedCampComponent', () => {
  let component: ViewLanchedCampComponent;
  let fixture: ComponentFixture<ViewLanchedCampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewLanchedCampComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLanchedCampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
