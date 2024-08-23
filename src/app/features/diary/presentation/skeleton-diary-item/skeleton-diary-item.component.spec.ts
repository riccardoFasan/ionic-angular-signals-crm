import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonDiaryItemComponent } from './skeleton-diary-item.component';

describe('SkeletonDiaryItemComponent', () => {
  let component: SkeletonDiaryItemComponent;
  let fixture: ComponentFixture<SkeletonDiaryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonDiaryItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonDiaryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
