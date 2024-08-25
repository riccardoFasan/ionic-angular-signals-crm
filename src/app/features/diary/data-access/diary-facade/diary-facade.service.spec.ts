import { TestBed } from '@angular/core/testing';
import { DiaryFacadeService } from './diary-facade.service';

describe('DiaryFacadeService', () => {
  let service: DiaryFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaryFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
