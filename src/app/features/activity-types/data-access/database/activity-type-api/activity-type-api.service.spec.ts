import { TestBed } from '@angular/core/testing';

import { ActivityTypeApiService } from './activity-type-api.service';

describe('ActivityTypeApiService', () => {
  let service: ActivityTypeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityTypeApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
