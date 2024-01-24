import { TestBed } from '@angular/core/testing';

import { DiaryApiService } from './diary-api.service';

describe('DiaryApiService', () => {
  let service: DiaryApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaryApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
