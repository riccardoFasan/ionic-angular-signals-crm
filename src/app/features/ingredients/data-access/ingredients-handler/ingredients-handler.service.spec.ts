import { TestBed } from '@angular/core/testing';

import { IngredientsHandlerService } from './ingredients-handler.service';

describe('IngredientsHandlerService', () => {
  let service: IngredientsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredientsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
