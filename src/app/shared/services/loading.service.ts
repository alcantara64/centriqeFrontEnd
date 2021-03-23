/** 08022021 - Gaurav - Init version: service for Progress-Bar
 * 09022021 - Gaurav - Added option for progress Spinner control
 */
import { Injectable } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';
import { consoleLog } from '../util/common.util';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _mode: ProgressBarMode = 'indeterminate';
  private _loadingSub = new BehaviorSubject<boolean>(false);
  private _spinnerSub = new BehaviorSubject<boolean>(false);

  loading$: Observable<boolean> = this._loadingSub.asObservable();
  spinner$: Observable<boolean> = this._spinnerSub.asObservable();

  get mode(): ProgressBarMode {
    return this._mode;
  }

  showProgressBarUntilCompleted<T>(
    obs$: Observable<T>,
    mode = <ProgressBarMode>'indeterminate'
  ): Observable<T> {
    return of(null).pipe(
      tap(() => {
        this._mode = mode;
        this.loadingOn();
      }),
      concatMap(() => obs$),
      finalize(() => {
        // consoleLog({ valuesArr: ['finalized called for loading off'] });
        this.loadingOff();
      })
    );
  }

  loadingOn(): void {
    this._loadingSub.next(true);
  }

  loadingOff(): void {
    this._loadingSub.next(false);
  }

  /** 09022021 - Gaurav - Spinner related methods */
  showSpinnerUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
    return of(null).pipe(
      tap(() => this.showSpinner(true)),
      concatMap(() => obs$),
      finalize(() => {
        this.showSpinner(false);
      })
    );
  }

  showSpinner(value: boolean): void {
    this._spinnerSub.next(value);
  }
}
