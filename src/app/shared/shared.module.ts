/** 18112020 - Gaurav - Init version: A module for all shared components
 * 08022021 - Gaurav - Added Loading component
 * 16022021 - Gaurav - Added TrustResourceUrlPipe pipe
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

/** Angular Material Modules */
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Custome Components */
import { ProgressBarComponent } from './components/progress-bar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TrustResourceUrlPipe } from './pipes/trust-resource-url.pipe';
import { FilterFormControlArrayPipe } from './pipes/filter-form-control-array.pipe';
import { BaseComponent } from './base/base.component';
import { FileSizePipe } from './pipes/file-size.pipe';

@NgModule({
  declarations: [
    ProgressBarComponent,
    LoadingComponent,
    SpinnerComponent,
    TrustResourceUrlPipe,
    FilterFormControlArrayPipe,
    BaseComponent,
    FileSizePipe,
  ],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    /** Modules */
    CommonModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    /** Components */
    ProgressBarComponent,
    LoadingComponent,
    SpinnerComponent,
    /** Pipes */
    TrustResourceUrlPipe,
    FilterFormControlArrayPipe,
    FileSizePipe,
  ],
})
export class SharedModule {}
