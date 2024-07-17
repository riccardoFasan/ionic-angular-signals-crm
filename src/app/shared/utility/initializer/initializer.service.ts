import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subject, defer, filter, switchMap, tap } from 'rxjs';
import { ActivityTypeApiService } from 'src/app/features/activity-types/data-access/database';
import {
  ActivityApiService,
  ActivityTagApiService,
  MealApiService,
  MealFoodApiService,
} from 'src/app/features/meals/data-access/database';
import {
  FoodApiService,
  FoodIngredientApiService,
} from 'src/app/features/foods/data-access/database';
import { TagApiService } from 'src/app/features/tags/data-access/database';
import { DatabaseService } from '../database/database.service';
import { generate } from 'generate-password-browser';
import { IngredientApiService } from 'src/app/features/ingredients/data-access/database';

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

  private state = signal<{ initialized: boolean }>({ initialized: false });
  initialized = computed<boolean>(() => this.state().initialized);

  readonly initialize$ = new Subject<void>();

  constructor() {
    this.initialize$
      .pipe(
        filter(() => !this.initialized()),
        switchMap(() => defer(() => this.initDatabase())),
        tap(() => this.state.set({ initialized: true })),
        takeUntilDestroyed(),
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
    const secret = this.generateRandomSecret();
    await this.database.encryptSqliteConnection(secret);

    await this.database.createDatabaseConnection();

    const activityAndRelated = [
      this.tagApi.createTable(),
      this.activityTypeApi.createTable(),
      this.activityApi.createTable(),
      this.activityTagApi.createTable(),
    ];

    const foodAndRelated = [
      this.ingredientApi.createTable(),
      this.foodApi.createTable(),
      this.foodIngredientApi.createTable(),
      this.mealApi.createTable(),
      this.mealFoodApi.createTable(),
    ];

    await Promise.all([...activityAndRelated, ...foodAndRelated]);
  }

  private async showSplashScreen(): Promise<void> {
    await SplashScreen.hide(); // must called at start (read docs)
    await SplashScreen.show({ autoHide: false });
  }

  private async hideSplashScreen(): Promise<void> {
    await SplashScreen.hide();
  }

  private generateRandomSecret(): string {
    return generate({ length: 32, numbers: true, symbols: true });
  }
}
