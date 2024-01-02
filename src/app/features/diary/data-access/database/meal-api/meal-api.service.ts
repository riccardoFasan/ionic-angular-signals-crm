import { Injectable, inject } from '@angular/core';
import { DatabaseService, List, nowIsoString } from 'src/app/shared/utility';
import { MealDTO } from '../meal.dto';

@Injectable({
  providedIn: 'root',
})
export class MealApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS meal (
        id INTEGER PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        at TEXT NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  async getList(pageIndex: number, pageSize: number): Promise<List<MealDTO>> {
    const offset = pageIndex * pageSize;

    const listResult = await this.database.query(
      `SELECT * FROM meal
      LIMIT ${pageSize} OFFSET ${offset};`,
    );

    const countResult = await this.database.query(`SELECT COUNT(*) FROM meal;`);

    const items: MealDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
  }

  async get(id: number): Promise<MealDTO> {
    const result = await this.database.query(
      `SELECT * FROM meal WHERE id = ${id};`,
    );
    const item = result?.values?.[0];

    if (!item) throw new Error(`Not found meal with id ${id}.`);

    return item;
  }

  async create(name: string, at: string, notes?: string): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO meal (created_at, updated_at, at, name, notes)
      VALUES ("${nowIsoString()}", "${nowIsoString()}", "${at}", "${name}", "${notes}") RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(
    id: number,
    name: string,
    at: string,
    notes?: string,
  ): Promise<void> {
    await this.database.query(
      `UPDATE meal
      SET updated_at = "${nowIsoString()}", at = "${at}", name = "${name}", notes = "${notes}"
      WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(`DELETE FROM meal WHERE id = ${id};`);
  }
}
