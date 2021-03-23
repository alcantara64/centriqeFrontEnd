import { SnackbarService } from './../../shared/components/snackbar.service';
import { DashboardComponent } from './../../dashboard/dashboard.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from 'src/app/shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

fdescribe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: AuthService;
  let router: Router;
  let snackbarService: SnackbarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      providers: [AuthService],
      imports: [
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        SharedModule,
        RouterTestingModule.withRoutes(
          [{path: './dashboard', component: DashboardComponent}]
        ),
        MatCardModule,
        MatExpansionModule,
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    snackbarService = TestBed.inject(SnackbarService)
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('[Password] should check if user password is invalid', () => {
    let password = component.resetPasswordForm.controls['password'];
    expect(password.valid).toBeFalsy();
    expect(password.pristine).toBeTruthy();
    expect(password.touched).toBeFalsy();
    password.setValue('testVal'); //check if password is not equal to eight
    expect(password.errors).toBeTruthy();
  })
  it('[password] should check for password validity', () =>{
    let password = component.resetPasswordForm.controls['password'];
    password.setValue('testVal4')
    expect(password.valid).toBeTruthy();
    // expect(password.pristine).toBeFalsy();
    // expect(password.touched).toBeTruthy();
    expect(password.errors).toBeFalsy();
  } )
  it('[Form] should be valid when confirm password', () =>{
    let password = component.resetPasswordForm.controls['password'].setValue('testVal4');
    let confirmPassword = component.resetPasswordForm.controls['confirmPassword'].setValue('testVal4');
    
    expect(component.resetPasswordForm.valid).toBeTruthy();

  } )
  it('[changePassword] should be able to submit form', () =>{
     component.resetPasswordForm.controls['password'].setValue('testVal4');
     component.resetPasswordForm.controls['confirmPassword'].setValue('testVal4');
     spyOn(authService, 'resetPassword').and.resolveTo({message:'created successfully'});
     spyOn(component._router, 'navigate');
   
    component.changePassword( component.resetPasswordForm);
    fixture.detectChanges()
    //expect(component.isSubmitButtonDisabled).toBeTruthy();
    expect(authService.isResetPasswordOnLogon ).toBeFalsy();
    expect(authService.resetPassword).toHaveBeenCalled();
   // expect(router.navigate).toHaveBeenCalled();

  } )
  it('[changePassword] should throw an error auth service fails', () =>{
    component.resetPasswordForm.controls['password'].setValue('testVal4');
    component.resetPasswordForm.controls['confirmPassword'].setValue('testVal4');
    spyOn(authService, 'resetPassword').and.rejectWith({message:'An error occurred'});
    spyOn(snackbarService, 'showError')
   component.changePassword(component.resetPasswordForm);
   expect(component.isSubmitButtonDisabled).toBeFalsy();
   expect(authService.resetPassword).toHaveBeenCalled();
  // expect(snackbarService.showError).toHaveBeenCalled();

 } )
});
