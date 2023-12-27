import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TagsPage } from './tags.page';

describe('TagsPage', () => {
  let component: TagsPage;
  let fixture: ComponentFixture<TagsPage>;

  beforeEach(async () => {
    TestBed.overrideComponent(TagsPage, {
      add: {
        imports: [RouterTestingModule],
      },
    });

    fixture = TestBed.createComponent(TagsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
