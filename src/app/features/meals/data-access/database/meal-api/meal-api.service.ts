import { Injectable, inject } from '@angular/core';
import {
  DatabaseService,
  List,
  NotFoundError,
  SearchCriteria,
  nowIsoString,
} from 'src/app/shared/utility';
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

  async getList(searchCriteria: SearchCriteria): Promise<List<MealDTO>> {
    let selectQuery = `SELECT * FROM meal`;
    const countQuery = `SELECT COUNT(*) FROM meal;`;

    const { filters, sortings } = searchCriteria;

    if (filters) {
      const filterClauses = Object.entries(filters.query)
        .reduce((clauses: string[], [field, value]) => {
          if (value === undefined) return clauses;
          return [...clauses, `${field} LIKE '%${value}%'`];
        }, [])
        .join(filters.clause);
      if (filterClauses) selectQuery += ` WHERE ${filterClauses}`;
    }

    if (sortings && sortings.length > 0) {
      selectQuery += ' ORDER BY ';

      sortings.forEach(({ property, order }, i) => {
        selectQuery += `${property} ${order}`;
        if (i < sortings.length - 1) selectQuery += ', ';
      });
    }

    const { pageIndex, pageSize } = searchCriteria.pagination;
    const offset = pageIndex * pageSize;
    selectQuery += ` LIMIT ${pageSize} OFFSET ${offset};`;

    const [listResult, countResult] = await Promise.all([
      this.database.query(selectQuery),
      this.database.query(countQuery),
    ]);

    const items: MealDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
  }

  async get(id: number): Promise<MealDTO> {
    const result = await this.database.query(
      `SELECT * FROM meal WHERE id = ${id};`,
    );
    const item = result?.values?.[0];

    if (!item) throw new NotFoundError(`Not found meal with id ${id}.`);

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
