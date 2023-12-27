import { Routes } from '@angular/router';

export const DIARY_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./diary-page/diary.page').then((m) => m.DiaryPage),
  },
];
