import { TestBed } from '@angular/core/testing';
import { IngredientModalsService } from './ingredient-modals.service';

describe('IngredientModalsService', () => {
  let service: IngredientModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredientModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
