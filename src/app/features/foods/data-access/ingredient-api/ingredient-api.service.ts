import { Injectable, inject } from '@angular/core';
import { DatabaseService, NotFoundError } from 'src/app/shared/utility';
import { Ingredient } from '../../ingredient.model';
import { List } from 'src/app/shared/utility/list.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientApiService {
  private readonly database = inject(DatabaseService);

  async createIngredientTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS ingredient (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  async getIngredients(
    page: number,
    pageSize: number
  ): Promise<List<Ingredient>> {
    const offset = (page - 1) * pageSize;

    const listResult = await this.database.query(
      `SELECT * FROM ingredient
      LIMIT ${pageSize} OFFSET ${offset};`
    );

    const countResult = await this.database.query(
      `SELECT COUNT(*) FROM ingredient;`
    );

    const items = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return {
      page,
      pageSize,
      total,
      items: items.map(this.mapToIngredient),
    };
  }

  async getIngredient(id: number): Promise<Ingredient> {
    const result = await this.database.query(
      `SELECT * FROM ingredient WHERE id = ${id};`
    );
    const item = result?.values?.[0];

    if (!item) throw new NotFoundError(`Not found ingredient with id ${id}.`);

    return this.mapToIngredient(item);
  }

  async createIngredient(name: string, notes: string): Promise<Ingredient> {
    const now = new Date().toISOString();
    const result = await this.database.query(
      `INSERT INTO ingredient (created_at, updated_at, name, notes)
      VALUES ("${now}", "${now}", "${name}", "${notes}") RETURNING *;`
    );
    const id = result.values?.[0].id;
    return await this.getIngredient(id!);
  }

  async updateIngredient(
    id: number,
    name: string,
    notes: string
  ): Promise<Ingredient> {
    const now = new Date().toISOString();
    await this.database.query(
      `UPDATE ingredient
      SET updated_at = "${now}", name = "${name}", notes = "${notes}"
      WHERE id = ${id};`
    );
    return await this.getIngredient(id);
  }

  async deleteIngredient(id: number): Promise<Ingredient> {
    const ingredient = await this.getIngredient(id);

    await this.database.query(
      `DELETE FROM ingredient
      WHERE id = ${id};`
    );

    return ingredient;
  }

  private mapToIngredient(item: any): Ingredient {
    return {
      id: item.id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      name: item.name,
      notes: item.notes,
    };
  }
}
