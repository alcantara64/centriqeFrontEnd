/** 18112020 - Gaurav - Init commit: Auth Feature Module */
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';

/** Angular Material modules */
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  declarations: [LoginComponent, ResetPasswordComponent],
  imports: [
    SharedModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    ReactiveFormsModule,
  ],
})
export class AuthModule {}
