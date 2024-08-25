import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityTypeFormComponent } from './activity-type-form.component';

describe('ActivityTypeFormComponent', () => {
  let component: ActivityTypeFormComponent;
  let fixture: ComponentFixture<ActivityTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityTypeFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
