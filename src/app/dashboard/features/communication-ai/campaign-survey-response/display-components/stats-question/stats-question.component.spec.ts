import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsQuestionComponent } from './stats-question.component';

describe('StatsQuestionComponent', () => {
  let component: StatsQuestionComponent;
  let fixture: ComponentFixture<StatsQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
