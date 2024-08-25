import { TestBed } from '@angular/core/testing';
import { FoodModalsService } from './food-modals.service';

describe('FoodModalsService', () => {
  let service: FoodModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
