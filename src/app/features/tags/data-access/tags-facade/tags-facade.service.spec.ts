import { TestBed } from '@angular/core/testing';
import { TagsFacadeService } from './tags-facade.service';

describe('TagsFacadeService', () => {
  let service: TagsFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagsFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
