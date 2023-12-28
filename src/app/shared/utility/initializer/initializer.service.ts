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
  FoodIngredientApiService,
  IngredientApiService,
} from 'src/app/features/foods/data-access/database';
import { TagApiService } from 'src/app/features/tags/data-access';
import { DatabaseService } from '../database/database.service';

@Injectable({
  providedIn: 'root',
})
export class InitializerService {
  private readonly database = inject(DatabaseService);
  private readonly tagApi = inject(TagApiService);
  private readonly activityTypeApi = inject(ActivityTypeApiService);
  private readonly activityApi = inject(ActivityApiService);
  private readonly ingredientApi = inject(IngredientApiService);
  private readonly foodIngredientApi = inject(FoodIngredientApiService);
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
    await this.database.createConnection();

    const activityAndRelated = Promise.all([
      this.tagApi.createTagTable(),
      this.activityTypeApi.createActivityTypeTable(),
      this.activityApi.createActivityTable(),
      this.activityApi.createActivityTagsTable(),
    ]);

    const foodAndRelated = Promise.all([
      this.ingredientApi.createIngredientTable(),
      this.foodApi.createFoodTable(),
      this.foodIngredientApi.createFoodIngredientsTable(),
      this.mealApi.createMealTable(),
      this.mealApi.createMealFoodsTable(),
    ]);

    await Promise.all([activityAndRelated, foodAndRelated]);

    // const ingredient = await this.ingredientApi.createIngredient(
    //   'Tony',
    //   'Stecchino'
    // );
    // console.log('Created', ingredient);

    // const ingredients = await this.ingredientApi.getIngredients(1, 10);
    // console.log('List', ingredients);

    // const updatedIngredient = await this.ingredientApi.updateIngredient(
    //   ingredient.id,
    //   'Tony',
    //   'Stark'
    // );
    // console.log('Updated', updatedIngredient);

    // const deletedIngredient = await this.ingredientApi.deleteIngredient(
    //   ingredient.id
    // );
    // console.log('Deleted', deletedIngredient);
  }

  private async showSplashScreen(): Promise<void> {
    await SplashScreen.hide(); // must called at start (read docs)
    await SplashScreen.show({ autoHide: false });
  }

  private async hideSplashScreen(): Promise<void> {
    await SplashScreen.hide();
  }
}
