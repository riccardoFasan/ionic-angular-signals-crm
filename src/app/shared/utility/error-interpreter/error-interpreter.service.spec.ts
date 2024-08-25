import { TestBed } from '@angular/core/testing';
import { ErrorInterpreterService } from './error-interpreter.service';

describe('ErrorInterpreterService', () => {
  let service: ErrorInterpreterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorInterpreterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
