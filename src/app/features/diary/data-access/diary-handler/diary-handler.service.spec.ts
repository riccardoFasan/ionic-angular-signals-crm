import { TestBed } from '@angular/core/testing';

import { DiaryHandlerService } from './diary-handler.service';

describe('DiaryHandlerService', () => {
  let service: DiaryHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaryHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
