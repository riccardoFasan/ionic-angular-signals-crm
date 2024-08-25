import { TestBed } from '@angular/core/testing';
import { ActivityTypesHandlerService } from './activity-types-handler.service';

describe('ActivityTypesHandlerService', () => {
  let service: ActivityTypesHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityTypesHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
