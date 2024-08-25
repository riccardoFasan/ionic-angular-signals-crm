import { TestBed } from '@angular/core/testing';
import { ActivityTypesFacadeService } from './activity-types-facade.service';

describe('ActivityTypesFacadeService', () => {
  let service: ActivityTypesFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityTypesFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
