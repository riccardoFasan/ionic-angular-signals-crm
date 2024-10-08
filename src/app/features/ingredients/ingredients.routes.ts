import { Routes } from '@angular/router';

export const INGREDIENTS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./ingredients-page/ingredients.page').then(
        (m) => m.IngredientsPage,
      ),
  },
  {
    path: ':ingredientId/foods',
    loadComponent: () =>
      import('./ingredient-foods-page/ingredient-foods.page').then(
        (m) => m.IngredientFoodsPage,
      ),
  },
];
