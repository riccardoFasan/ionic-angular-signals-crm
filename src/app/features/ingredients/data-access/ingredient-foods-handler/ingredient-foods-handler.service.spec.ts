import { TestBed } from '@angular/core/testing';

import { IngredientFoodsHandlerService } from './ingredient-foods-handler.service';

describe('IngredientFoodsHandlerService', () => {
  let service: IngredientFoodsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredientFoodsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
