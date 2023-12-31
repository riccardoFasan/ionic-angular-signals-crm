import { TestBed } from '@angular/core/testing';

import { ActivityApiService } from './activity-api.service';

describe('ActivityApiService', () => {
  let service: ActivityApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
