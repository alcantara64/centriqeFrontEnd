/** 16012021 - Gaurav - Shared pipe: pass in a resource url (iframe or script) to sanitise it and mark as safe.
 * Be careful of what you pass, though! Carefully check and audit all values and code paths going into this call!!
 * Reference: https://angular.io/api/platform-browser/DomSanitizer
 * Security guide: https://angular.io/guide/security */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'trustResourceUrl',
})
export class TrustResourceUrlPipe implements PipeTransform {
  constructor(private _domSanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this._domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
