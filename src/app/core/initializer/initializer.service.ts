import { Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subject, defer, filter, switchMap, tap } from 'rxjs';
import { ActivityTypeApiService } from 'src/app/features/activity-types/data-access';
import {
  ActivityApiService,
  MealApiService,
} from 'src/app/features/diary/data-access';
import {
  FoodApiService,
  IngredientApiService,
} from 'src/app/features/foods/data-access';
import { TagApiService } from 'src/app/features/tags/data-access';

@Injectable({
  providedIn: 'root',
})
export class InitializerService {
  private readonly tagApi = inject(TagApiService);
  private readonly activityTypeApi = inject(ActivityTypeApiService);
  private readonly activityApi = inject(ActivityApiService);
  private readonly ingredientApi = inject(IngredientApiService);
  private readonly foodApi = inject(FoodApiService);
  private readonly mealApi = inject(MealApiService);

  private readonly initialized = signal<boolean>(false);

  readonly initialize$ = new Subject<void>();

  constructor() {
    this.initialize$
      .pipe(
        takeUntilDestroyed(),
        filter(() => !this.initialized()),
        switchMap(() => defer(() => this.initDatabase())),
        tap(() => this.initialized.set(true))
      )
      .subscribe();

    effect(() => {
      const initialized = this.initialized();

      if (initialized) {
        this.hideSplashScreen();
        return;
      }

      this.showSplashScreen();
    });
  }

  private async initDatabase(): Promise<void> {
    const activityAndRelated = Promise.all([
      this.tagApi.createTagTable(),
      this.activityTypeApi.createActivityTypeTable(),
      this.activityApi.createActivityTable(),
      this.activityApi.createActivityTagsTable(),
    ]);
    const foodAndRelated = Promise.all([
      this.ingredientApi.createIngredientTable(),
      this.foodApi.createFoodTable(),
      this.foodApi.createFoodIngredientsTable(),
      this.mealApi.createMealTable(),
      this.mealApi.createMealFoodsTable(),
    ]);
    await Promise.all([activityAndRelated, foodAndRelated]);
  }

  private async showSplashScreen(): Promise<void> {
    await SplashScreen.hide();
    await SplashScreen.show({ autoHide: false });
  }

  private async hideSplashScreen(): Promise<void> {
    await SplashScreen.hide();
  }
}
