/** 18112020 - Gaurav - Init version: First component to load on starting the web app,
 * control access to the Centriqe app.
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

/** Get Services */
import { AuthService } from '../auth.service';

/** Get UI Components */
import { MatExpansionPanel } from '@angular/material/expansion';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  isLoading = true;

  /** Forgot User ID / Password: MatExpansionPanel related code props */
  forgotPanelOpenState = false;
  @ViewChild(MatExpansionPanel) forgotPanel!: MatExpansionPanel;

  hide = true;
  isResetPasswordOnLogon: boolean = false;
  isDisableForgotSubmitButton: boolean = false;
  isDisableLoginSubmitButton: boolean = false;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.isLoading = false;
    this._authService.getAuthStatusListener().subscribe(res => {
      this.isResetPasswordOnLogon = res.isResetPasswordOnLogon;
      this.isDisableLoginSubmitButton = false;
    });
  }

  onLogin(formLogin: NgForm) {
    if (!formLogin.valid) return;

    this.isLoading = true;
    /** http subs are unsubscribed automaticall by angular, so not unsubscribing it here */
    this._authService
      .login(formLogin.value.username, formLogin.value.password)
      .subscribe(
        (response) => {
          this.isDisableLoginSubmitButton = true;
          this.isResetPasswordOnLogon = response.isResetPasswordOnLogon;
          if (!this.isResetPasswordOnLogon) {
            this._router.navigate(['/dashboard']);
          }
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          // Clear any cache set
          this._authService.logout();
        }
      );
  }

  onForgotCredentials(formForgot: NgForm) {
    //TODO: add forgot credentials feature logic
    this._authService.forgotPassword(formForgot.value.email).then(res => {
      this._snackbarService.showSuccess(res.message);
      this.isDisableForgotSubmitButton = true
      formForgot.control.controls.email.disable;
    })
    .catch(err => {
        this._snackbarService.showError(err.message);
    })

  }

  closePanel() {
    /** Close the forgot feature panel if user navigates away to click on the login form,
     * only if it is already open */
    if (this.forgotPanel.expanded) this.forgotPanel.close();
  }
}
