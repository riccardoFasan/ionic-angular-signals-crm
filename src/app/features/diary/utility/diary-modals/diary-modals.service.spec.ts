import { TestBed } from '@angular/core/testing';

import { DiaryModalsService } from './diary-modals.service';

describe('DiaryModalsService', () => {
  let service: DiaryModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaryModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
