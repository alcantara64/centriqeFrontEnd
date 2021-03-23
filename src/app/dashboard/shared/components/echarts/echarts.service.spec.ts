import { TestBed } from '@angular/core/testing';

import { EchartsService } from './echarts.service';

describe('EchartsService', () => {
  let service: EchartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EchartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
