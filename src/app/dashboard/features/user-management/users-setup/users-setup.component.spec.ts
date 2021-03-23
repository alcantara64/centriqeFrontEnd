import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersSetupComponent } from './users-setup.component';

describe('UsersSetupComponent', () => {
  let component: UsersSetupComponent;
  let fixture: ComponentFixture<UsersSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
