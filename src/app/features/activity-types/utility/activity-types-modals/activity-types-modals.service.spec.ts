import { TestBed } from '@angular/core/testing';

import { ActivityTypesModalsService } from './activity-types-modals.service';

describe('ActivityTypesModalsService', () => {
  let service: ActivityTypesModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityTypesModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
