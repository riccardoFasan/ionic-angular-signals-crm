import { Injectable, inject } from '@angular/core';
import { DatabaseService, List, NotFoundError } from 'src/app/shared/utility';
import { FoodDTO } from '../food.dto';

@Injectable({
  providedIn: 'root',
})
export class FoodApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS food (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  async getList(page: number, pageSize: number): Promise<List<FoodDTO>> {
    const offset = (page - 1) * pageSize;

    const listResult = await this.database.query(
      `SELECT * FROM food
      LIMIT ${pageSize} OFFSET ${offset};`,
    );

    const countResult = await this.database.query(`SELECT COUNT(*) FROM food;`);

    const items: FoodDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { page, pageSize, total, items };
  }

  async get(id: number): Promise<FoodDTO> {
    const result = await this.database.query(
      `SELECT * FROM food WHERE id = ${id};`,
    );
    const item: FoodDTO = result?.values?.[0];

    if (!item) throw new NotFoundError(`Not found food with id ${id}.`);

    return item;
  }

  async create(name: string, notes?: string): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO food (created_at, updated_at, name, notes)
      VALUES (datetime('now'), datetime('now'), "${name}", "${notes}") RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(id: number, name: string, notes?: string): Promise<void> {
    await this.database.query(
      `UPDATE food
      SET updated_at = datetime('now'), name = "${name}", notes = "${notes}"
      WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(
      `DELETE FROM food
      WHERE id = ${id};`,
    );
  }
}
