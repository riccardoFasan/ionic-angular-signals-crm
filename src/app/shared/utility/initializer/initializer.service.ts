import { Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subject, defer, filter, switchMap, tap } from 'rxjs';
import { ActivityTypeApiService } from 'src/app/features/activity-types/data-access/database';
import {
  ActivityApiService,
  ActivityTagApiService,
  MealApiService,
  MealFoodApiService,
} from 'src/app/features/diary/data-access/database';
import {
  FoodApiService,
  FoodIngredientApiService,
  IngredientApiService,
} from 'src/app/features/foods/data-access/database';
import { TagApiService } from 'src/app/features/tags/data-access/database';
import { DatabaseService } from '../database/database.service';

@Injectable({
  providedIn: 'root',
})
export class InitializerService {
  private database = inject(DatabaseService);
  private tagApi = inject(TagApiService);
  private activityTypeApi = inject(ActivityTypeApiService);
  private activityApi = inject(ActivityApiService);
  private activityTagApi = inject(ActivityTagApiService);
  private ingredientApi = inject(IngredientApiService);
  private foodIngredientApi = inject(FoodIngredientApiService);
  private foodApi = inject(FoodApiService);
  private mealApi = inject(MealApiService);
  private mealFoodApi = inject(MealFoodApiService);

  private initialized = signal<boolean>(false);

  readonly initialize$ = new Subject<void>();

  constructor() {
    this.initialize$
      .pipe(
        takeUntilDestroyed(),
        filter(() => !this.initialized()),
        tap(() => this.initialized.set(false)),
        switchMap(() => defer(() => this.initDatabase())),
        tap(() => this.initialized.set(true)),
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
    await this.database.createConnection();

    const activityAndRelated = Promise.all([
      this.tagApi.createTable(),
      this.activityTypeApi.createTable(),
      this.activityApi.createTable(),
      this.activityTagApi.createTable(),
    ]);

    const foodAndRelated = Promise.all([
      this.ingredientApi.createTable(),
      this.foodApi.createTable(),
      this.foodIngredientApi.createTable(),
      this.mealApi.createTable(),
      this.mealFoodApi.createTable(),
    ]);

    await Promise.all([activityAndRelated, foodAndRelated]);
  }

  private async showSplashScreen(): Promise<void> {
    await SplashScreen.hide(); // must called at start (read docs)
    await SplashScreen.show({ autoHide: false });
  }

  private async hideSplashScreen(): Promise<void> {
    await SplashScreen.hide();
  }
}
