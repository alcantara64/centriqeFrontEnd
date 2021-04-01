import { Injectable } from '@angular/core';

export interface MatTableProperties {
  pageSize: number;
  pageSizeOptions: number[];
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private _matTableProperties: MatTableProperties = {
    pageSize: 30,
    pageSizeOptions: [10, 20, 30, 50, 70],
  };

  get systemMatTableProperties(): MatTableProperties {
    return {...this._matTableProperties}
  }
}
