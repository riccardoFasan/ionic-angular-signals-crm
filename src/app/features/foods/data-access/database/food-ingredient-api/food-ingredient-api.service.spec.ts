import { TestBed } from '@angular/core/testing';
import { FoodIngredientApiService } from './food-ingredient-api.service';

describe('FoodIngredientApiService', () => {
  let service: FoodIngredientApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodIngredientApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
