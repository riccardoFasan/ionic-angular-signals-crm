import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'diary',
    pathMatch: 'full',
  },
  {
    path: 'diary',
    loadChildren: () =>
      import('./features/diary/diary.routes').then((m) => m.DIARY_ROUTES),
  },
  {
    path: 'activity-types',
    loadChildren: () =>
      import('./features/activity-types/activity-types.routes').then(
        (m) => m.ACTIVITY_TYPES_ROUTES,
      ),
  },
  {
    path: 'tags',
    loadChildren: () =>
      import('./features/tags/tags.routes').then((m) => m.TAGS_ROUTES),
  },
  {
    path: 'foods',
    loadChildren: () =>
      import('./features/foods/foods.routes').then((m) => m.FOODS_ROUTES),
  },
  {
    path: 'ingredients',
    loadChildren: () =>
      import('./features/ingredients/ingredients.routes').then(
        (m) => m.INGREDIENTS_ROUTES,
      ),
  },
];
