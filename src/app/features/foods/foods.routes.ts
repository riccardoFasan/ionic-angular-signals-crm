import { Routes } from '@angular/router';

export const FOODS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./foods-page/foods.page').then((m) => m.FoodsPage),
  },
];
