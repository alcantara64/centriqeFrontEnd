/** 18112020 - Gaurav - Init version
 * 19112020 - Gaurav - Added check for local user session check on each 'page' refresh
 */
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private _authService: AuthService) {
    /** 08032021 - Gaurav - JIRA-CA-231: Disallow console.log to seep in prod environment, allow only when env variable (allowConsoleLogs === true) */
    if (!environment?.allowConsoleLogs) {
      if (window) {
        window.console.table = window.console.log = window.console.warn = window.console.info = window.console.dir = function () {
          // Don't log anything.
        };
      }
    }
  }

  ngOnInit() {
    /** Check cache for user session and login or logout user */
    this._authService.autoLogin();
  }
}
