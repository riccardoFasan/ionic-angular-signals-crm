import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/data-access';

@Injectable({
  providedIn: 'root',
})
export class MealApiService {
  private readonly database = inject(DatabaseService);

  async createMealTable(): Promise<void> {
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS meal (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        at DATETIME NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  async createMealFoodsTable(): Promise<void> {
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS meal_foods (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        meal_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        FOREIGN KEY (meal_id) REFERENCES meal (id),
        FOREIGN KEY (food_id) REFERENCES food (id)
      );`);
  }
}