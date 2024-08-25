import { TestBed } from '@angular/core/testing';
import { FoodsFacadeService } from './foods-facade.service';

describe('FoodsFacadeService', () => {
  let service: FoodsFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodsFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
