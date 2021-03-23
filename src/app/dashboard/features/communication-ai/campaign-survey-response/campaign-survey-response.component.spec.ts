import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignSurveyResponseComponent } from './campaign-survey-response.component';

describe('CampaignSurveyResponseComponent', () => {
  let component: CampaignSurveyResponseComponent;
  let fixture: ComponentFixture<CampaignSurveyResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignSurveyResponseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignSurveyResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
