import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/data-access';

@Injectable({
  providedIn: 'root',
})
export class FoodApiService {
  private readonly database = inject(DatabaseService);

  async createFoodTable(): Promise<void> {
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS food (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  async createFoodIngredientsTable(): Promise<void> {
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS food_ingredients (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        food_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        FOREIGN KEY (food_id) REFERENCES food (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredient (id)
      );`);
  }
}
