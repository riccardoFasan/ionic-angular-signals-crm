import { TestBed } from '@angular/core/testing';
import { MealsFacadeService } from './meals-facade.service';

describe('MealsFacadeService', () => {
  let service: MealsFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealsFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
