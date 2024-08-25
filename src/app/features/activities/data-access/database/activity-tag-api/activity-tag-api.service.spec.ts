import { TestBed } from '@angular/core/testing';
import { ActivityTagApiService } from './activity-tag-api.service';

describe('ActivityTagApiService', () => {
  let service: ActivityTagApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityTagApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
