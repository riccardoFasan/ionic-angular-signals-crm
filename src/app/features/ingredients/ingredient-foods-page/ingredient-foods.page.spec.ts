import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientFoodsPage } from './ingredient-foods.page';

describe('IngredientFoodsPage', () => {
  let component: IngredientFoodsPage;
  let fixture: ComponentFixture<IngredientFoodsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientFoodsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientFoodsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
