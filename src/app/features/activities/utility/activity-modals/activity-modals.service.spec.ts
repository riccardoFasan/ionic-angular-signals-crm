import { TestBed } from '@angular/core/testing';

import { ActivityModalsService } from './activity-modals.service';

describe('ActivityModalsService', () => {
  let service: ActivityModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
