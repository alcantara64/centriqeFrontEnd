import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsTextResponsesComponent } from './stats-text-responses.component';

describe('StatsTextResponsesComponent', () => {
  let component: StatsTextResponsesComponent;
  let fixture: ComponentFixture<StatsTextResponsesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsTextResponsesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsTextResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
