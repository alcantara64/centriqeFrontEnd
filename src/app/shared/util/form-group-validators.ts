/** 05032021 - Gaurav - JIRA-CA-154: Created a common non-initializing (with static methods) util class for custom form group control validations */
import { AbstractControl, ValidatorFn } from '@angular/forms';

export class FormGroupValidators {
  static noFutureDatesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const today = new Date().getTime();

      if (!(control && control.value)) {
        return null;
      }

      /** Gaurav - Important note: careful renaming 'invalidDate' since it is the error identifier used inside mat-error validation checks */
      return control.value.getTime() > today
        ? { invalidDate: "Can't use future dates!" }
        : null;
    };
  }
}
