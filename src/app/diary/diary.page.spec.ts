import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DiaryPage } from './diary.page';

describe('DiaryPage', () => {
  let component: DiaryPage;
  let fixture: ComponentFixture<DiaryPage>;

  beforeEach(async () => {
    TestBed.overrideComponent(DiaryPage, {
      add: {
        imports: [RouterTestingModule],
      },
    });

    fixture = TestBed.createComponent(DiaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
