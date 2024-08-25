import { TestBed } from '@angular/core/testing';
import { IngredientsFacadeService } from './ingredients-facade.service';

describe('IngredientsFacadeService', () => {
  let service: IngredientsFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredientsFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
