/** 17122020 - Gaurav - Service for methods used to restrict/validate template input fields
 * 22122020 - Gaurav - Added removeSpecialCharacters(), getSanitizedAttribValue() and getRandomString()
 * 23122020 - Gaurav - (a hack): created static instance to call the methods here in simple classes where it can't be injected
 */
import { Injectable } from '@angular/core';

interface Options {
  lowercaseOnly?: boolean;
  anyCASE?: boolean;
  anyCaseNoSpecialChars?: boolean;
  noNumbers?: boolean;
  numberOnly?: boolean;
  numberOnlyNoZero?: boolean;
}

@Injectable()
export class TemplateFieldValidationService {
  static instance: TemplateFieldValidationService;
  constructor() {
    TemplateFieldValidationService.instance = this;
  }

  allowNoSpaceAndSpecialChars(
    event: KeyboardEvent,
    options?: Options
  ): boolean {
    let regex;

    if (options?.lowercaseOnly) {
      regex = new RegExp(/^[a-z0-9_-]*$/g);
    } else if (options?.anyCASE) {
      regex = new RegExp(/^[a-zA-Z0-9_-]*$/g);
    } else if (options?.anyCaseNoSpecialChars) {
      regex = new RegExp(/^[a-zA-Z0-9]*$/g);
    } else if (options?.noNumbers) {
      regex = new RegExp(/^[a-zA-Z]*$/g);
    } else if (options?.numberOnly) {
      regex = new RegExp(/^[0-9]*$/g);
    } else if (options?.numberOnlyNoZero) {
      regex = new RegExp(/^[1-9]*$/g);
    } else {
      new RegExp(/^[a-zA-Z0-9]*$/g);
    }

    let key = String.fromCharCode(
      !event.charCode ? event.which : event.charCode
    );
    if (!regex?.test(key)) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  /** Remove special characters and keep alphanumerics and white spaces, case-insensitve */
  removeSpecialCharacters(rawString: string): string {
    return rawString.replace(/[^\w\s]/gi, '');
  }

  /** Pass any string and get a camelCase string in return */
  getSanitizedCamelCaseValue(rawString: string): string {
    /** Sanitize label and concatenate to form value for ID attribute */
    const stringSanitized = this.removeSpecialCharacters(rawString);
    const stingSplitArr = stringSanitized.split(' ');
    let stringArray = <string[]>[];

    /** first lowercase all; then uppercase 1st char from 2nd word */
    stingSplitArr.forEach((value, i) => {
      const currentVal = value.toLowerCase();

      stringArray.push(
        i === 0
          ? currentVal
          : currentVal.charAt(0).toUpperCase() + currentVal.slice(1)
      );
    });
    const sanitizedString = stringArray.join('');
    return sanitizedString;
  }

  /** Get a random string based on the desired string length parameter */
  getRandomString(desiredStringLength: number): string {
    let randomString = '';

    let availableChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

    for (let i = 0; i < desiredStringLength; i++) {
      randomString += availableChars.charAt(
        Math.floor(Math.random() * availableChars.length)
      );
    }

    return randomString;
  }
}
