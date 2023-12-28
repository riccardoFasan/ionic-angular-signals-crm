import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/shared/utility';
import { FoodIngredientDTO } from '../food-ingredient.dto';

@Injectable({
  providedIn: 'root',
})
export class FoodIngredientApiService {
  private readonly database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS food_ingredient (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        food_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        FOREIGN KEY (food_id) REFERENCES food (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredient (id)
      );`);
  }

  async getByFood(foodId: number): Promise<FoodIngredientDTO[]> {
    const result = await this.database.query(`
      SELECT * FROM food_ingredient WHERE food_id = ${foodId};
    `);
    return result.values || [];
  }

  async getByIngredient(ingredientId: number): Promise<FoodIngredientDTO[]> {
    const result = await this.database.query(`
      SELECT * FROM food_ingredient WHERE ingredient_id = ${ingredientId};  
    `);
    return result.values || [];
  }

  async create(foodId: number, ingredientId: number): Promise<void> {
    await this.database.query(`
      INSERT INTO food_ingredient (created_at, updated_at, food_id, ingredient_id)
      VALUES (datetime('now'), datetime('now'), ${foodId}, ${ingredientId});
    `);
  }

  async delete(foodId: number, ingredientId: number): Promise<void> {
    await this.database.query(`
      DELETE FROM food_ingredient
      WHERE food_id = ${foodId} AND ingredient_id = ${ingredientId};
    `);
  }
}
