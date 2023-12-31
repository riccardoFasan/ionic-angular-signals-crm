import { TestBed } from '@angular/core/testing';

import { DetailStoreService } from './detail-store.service';

describe('DetailStoreService', () => {
  let service: DetailStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
