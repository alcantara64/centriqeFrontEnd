import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageEventsSetupComponent } from './message-events-setup.component';

describe('MessageEventsSetupComponent', () => {
  let component: MessageEventsSetupComponent;
  let fixture: ComponentFixture<MessageEventsSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessageEventsSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageEventsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
