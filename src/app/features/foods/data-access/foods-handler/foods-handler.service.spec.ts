import { TestBed } from '@angular/core/testing';

import { FoodsHandlerService } from './foods-handler.service';

describe('FoodsHandlerService', () => {
  let service: FoodsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
