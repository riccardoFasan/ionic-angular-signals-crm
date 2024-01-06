import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTypeModalComponent } from './activity-type-modal.component';

describe('ActivityTypeModalComponent', () => {
  let component: ActivityTypeModalComponent;
  let fixture: ComponentFixture<ActivityTypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityTypeModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
