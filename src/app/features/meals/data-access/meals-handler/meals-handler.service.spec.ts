import { TestBed } from '@angular/core/testing';
import { MealsHandlerService } from './meals-handler.service';

describe('MealsHandlerService', () => {
  let service: MealsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
