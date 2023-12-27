import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FoodsPage } from './foods.page';

describe('FoodsPage', () => {
  let component: FoodsPage;
  let fixture: ComponentFixture<FoodsPage>;

  beforeEach(async () => {
    TestBed.overrideComponent(FoodsPage, {
      add: {
        imports: [RouterTestingModule],
      },
    });

    fixture = TestBed.createComponent(FoodsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
