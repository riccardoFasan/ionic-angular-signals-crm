import { TestBed } from '@angular/core/testing';
import { ActivitiesHandlerService } from './activities-handler.service';

describe('ActivitiesHandlerService', () => {
  let service: ActivitiesHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivitiesHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
