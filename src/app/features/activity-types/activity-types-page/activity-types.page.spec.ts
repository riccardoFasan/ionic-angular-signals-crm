import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivityTypesPage } from './activity-types.page';

describe('ActivityTypesPage', () => {
  let component: ActivityTypesPage;
  let fixture: ComponentFixture<ActivityTypesPage>;

  beforeEach(async () => {
    TestBed.overrideComponent(ActivityTypesPage, {
      add: {
        imports: [RouterTestingModule],
      },
    });

    fixture = TestBed.createComponent(ActivityTypesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
