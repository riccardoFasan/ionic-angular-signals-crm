import { TestBed } from '@angular/core/testing';
import { TagsHandlerService } from './tags-handler.service';

describe('TagsHandlerService', () => {
  let service: TagsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
