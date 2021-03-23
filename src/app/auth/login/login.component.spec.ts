import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { AuthService } from '../auth.service';
import { LoginComponent } from './login.component';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let injector: TestBed;
  let authService: AuthService;
  let snackbarService: SnackbarService;
  let routerMock = { navigate: jasmine.createSpy('navigate') };
  let formLogin: NgForm;
  let form:NgForm;

  // * We use beforeEach so our tests are run in isolation
  beforeEach(() => {
    TestBed.configureTestingModule({
      // * here we configure our testing module with all the declarations,
      // * imports, and providers necessary to this component
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        FormsModule],
      providers: [
        { provide: Router, useValue: routerMock },
      ],
      declarations: [LoginComponent],
    }).compileComponents();
    injector = getTestBed();
    authService = injector.get(AuthService);
    snackbarService = injector.get(SnackbarService);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance; // The component instantiation 
    form = fixture.nativeElement.querySelector('form');
    // username = fixture.nativeElement.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoading false', () => {
    component.ngOnInit();
    expect(component.isLoading).toBe(false);
  });

  it('should call onLogin method with invalid formLogin', () => {
    component.onLogin(form);
    const result = !form.valid;
    expect(result).toBe(true);
  });
  
  it('should call onLogin method with valid formLogin', () => {
    component.onLogin(form);
    expect(component.isLoading).toBe(true);
    let username = fixture.nativeElement.querySelector('usernameInput');
    username = 'abhishek';
    let password = fixture.nativeElement.querySelector('passwordInput');
    password = 'abhi$cent$01';
    authService.login(username,password).subscribe((response) => {
      expect (routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.isLoading).toBe(false);
    },() => {
      expect(component.isLoading).toBe(false);
      expect(authService.logout()).toHaveBeenCalled()
    })
  });

  it('should call onForgotCredentials method', () => {
    let forgotForm:NgForm = fixture.nativeElement.querySelector('forgotForm');
    component.onForgotCredentials(forgotForm);
    const service: SnackbarService = TestBed.get(SnackbarService);
    const spy = spyOn(service, 'showError');
    service.showError('Forgot ID/Password feature is under development!');
    expect(spy).toHaveBeenCalled();
  });

  it('should call closePanel method',() => {
    component.closePanel();
    component.forgotPanel.expanded.and.returnValue(true);
    expect(component.forgotPanel.close).toHaveBeenCalled();
  })
});
