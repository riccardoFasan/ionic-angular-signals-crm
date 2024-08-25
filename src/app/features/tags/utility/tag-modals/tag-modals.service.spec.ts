import { TestBed } from '@angular/core/testing';
import { TagModalsService } from './tag-modals.service';

describe('TagModalsService', () => {
  let service: TagModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
