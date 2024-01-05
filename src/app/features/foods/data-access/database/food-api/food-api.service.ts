import { Injectable, inject } from '@angular/core';
import {
  DatabaseService,
  List,
  NotFoundError,
  SearchCriteria,
  nowIsoString,
} from 'src/app/shared/utility';
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
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        name TEXT NOT NULL,
        calories INTEGER,
        notes TEXT
      );`);
  }

  async getList(searchCriteria: SearchCriteria): Promise<List<FoodDTO>> {
    let selectQuery = `SELECT * FROM food`;
    const countQuery = `SELECT COUNT(*) FROM food;`;

    const { filters, sorting } = searchCriteria;

    if (filters) {
      const filterClauses = Object.entries(filters)
        .map(([field, value]) => `${field} LIKE '%${value}%'`)
        .join(' AND ');
      selectQuery += ` WHERE ${filterClauses}`;
    }

    if (sorting) {
      selectQuery += ` ORDER BY ${sorting.property} ${sorting.order}`;
    }

    const { pageIndex, pageSize } = searchCriteria.pagination;
    const offset = pageIndex * pageSize;
    selectQuery += ` LIMIT ${pageSize} OFFSET ${offset};`;

    const [listResult, countResult] = await Promise.all([
      this.database.query(selectQuery),
      this.database.query(countQuery),
    ]);

    const items: FoodDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
  }

  async get(id: number): Promise<FoodDTO> {
    const result = await this.database.query(
      `SELECT * FROM food WHERE id = ${id};`,
    );
    const item: FoodDTO = result?.values?.[0];

    if (!item) throw new NotFoundError(`Not found food with id ${id}.`);

    return item;
  }

  async create(
    name: string,
    notes?: string,
    calories?: number,
  ): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO food (created_at, updated_at, name, notes, calories)
      VALUES ("${nowIsoString()}", "${nowIsoString()}", "${name}", "${notes}", "${calories}") RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(
    id: number,
    name: string,
    notes?: string,
    calories?: number,
  ): Promise<void> {
    await this.database.query(
      `UPDATE food
      SET updated_at = "${nowIsoString()}", name = "${name}", notes = "${notes}", calories = "${calories}"
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
