import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class MealFoodApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS meal_food (
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

  async getByMeal(mealId: number): Promise<number[]> {
    const result = await this.database.query(`
      SELECT food_id FROM meal_food WHERE meal_id = ${mealId};
    `);
    return result.values || [];
  }

  async getByFood(foodId: number): Promise<number[]> {
    const result = await this.database.query(`
      SELECT meal_id FROM meal_food WHERE food_id = ${foodId};  
    `);
    return result.values || [];
  }

  async create(
    mealId: number,
    foodId: number,
    quantity: number,
  ): Promise<void> {
    await this.database.query(`
      INSERT INTO meal_food (created_at, updated_at, meal_id, food_id, quantity)
      VALUES (datetime('now'), datetime('now'), ${mealId}, ${foodId}, ${quantity});
    `);
  }

  async delete(mealId: number, foodId: number): Promise<void> {
    await this.database.query(`
      DELETE FROM meal_food
      WHERE meal_id = ${mealId} AND food_id = ${foodId};
    `);
  }
}
