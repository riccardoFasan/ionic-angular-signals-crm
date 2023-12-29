import { Injectable, inject } from '@angular/core';
import {
  DatabaseService,
  NotFoundError,
  List,
  nowIsoString,
} from 'src/app/shared/utility';
import { IngredientDTO } from '../ingredient.dto';

@Injectable({
  providedIn: 'root',
})
export class IngredientApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS ingredient (
        id INTEGER PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  async getList(page: number, pageSize: number): Promise<List<IngredientDTO>> {
    const offset = (page - 1) * pageSize;

    const listResult = await this.database.query(
      `SELECT * FROM ingredient
      LIMIT ${pageSize} OFFSET ${offset};`,
    );

    const countResult = await this.database.query(
      `SELECT COUNT(*) FROM ingredient;`,
    );

    const items: IngredientDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { page, pageSize, total, items };
  }

  async get(id: number): Promise<IngredientDTO> {
    const result = await this.database.query(
      `SELECT * FROM ingredient WHERE id = ${id};`,
    );
    const item = result?.values?.[0];

    if (!item) throw new NotFoundError(`Not found ingredient with id ${id}.`);

    return item;
  }

  async create(name: string, notes?: string): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO ingredient (created_at, updated_at, name, notes)
      VALUES ("${nowIsoString()}", "${nowIsoString()}", "${name}", "${notes}") RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(id: number, name: string, notes?: string): Promise<void> {
    await this.database.query(
      `UPDATE ingredient
      SET updated_at = "${nowIsoString()}", name = "${name}", notes = "${notes}"
      WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(`DELETE FROM ingredient WHERE id = ${id};`);
  }
}
