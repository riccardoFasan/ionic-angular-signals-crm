import { TestBed } from '@angular/core/testing';

import { MealModalsService } from './meal-modals.service';

describe('MealModalsService', () => {
  let service: MealModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
