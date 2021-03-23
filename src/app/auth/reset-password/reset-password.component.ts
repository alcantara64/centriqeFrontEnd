import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MyErrorStateMatcher } from 'src/app/core/external/error-state-macher';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  hide = true;
  isLoading:boolean= false;
  matcher = new MyErrorStateMatcher();
  isSubmitButtonDisabled: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private _authService: AuthService,
    public _router: Router,
    public _snackbarService: SnackbarService
    ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['']
    }, { validator: this.checkPasswords });
   }
  ngOnInit(): void {
  }
  changePassword(resetPasswordForm: FormGroup){
   if(!resetPasswordForm.valid) return;
   const payload = {password: resetPasswordForm.controls.password.value}
   this._authService.resetPassword(payload).then((response) =>{
    this.isSubmitButtonDisabled = true;
    this._authService.isResetPasswordOnLogon = false;
     this._snackbarService.showSuccess(response.message, 5000);
     this._authService.logout();
     this._router.navigate(['/login']);

   })
   .catch(error => {
     this._snackbarService.showError(error.message)
   })

  }
  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;
    return pass === confirmPass ? null : { notSame: true }
  }
}
