import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesSetupComponent } from './messages-setup.component';

describe('MessagesSetupComponent', () => {
  let component: MessagesSetupComponent;
  let fixture: ComponentFixture<MessagesSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessagesSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
