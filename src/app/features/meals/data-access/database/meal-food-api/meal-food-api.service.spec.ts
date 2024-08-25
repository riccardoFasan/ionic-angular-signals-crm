import { TestBed } from '@angular/core/testing';
import { MealFoodApiService } from './meal-food-api.service';

describe('MealFoodApiService', () => {
  let service: MealFoodApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealFoodApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
