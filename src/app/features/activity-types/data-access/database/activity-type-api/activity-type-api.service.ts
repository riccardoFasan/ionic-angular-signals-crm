import { Injectable, inject } from '@angular/core';
import {
  DatabaseService,
  List,
  NotFoundError,
  SearchCriteria,
  nowIsoString,
} from 'src/app/shared/utility';
import { ActivityTypeDTO } from '../activity-type.dto';

@Injectable({
  providedIn: 'root',
})
export class ActivityTypeApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS activity_type (
        id INTEGER PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT
      );
    `);
  }

  async getList(
    searchCriteria: SearchCriteria,
  ): Promise<List<ActivityTypeDTO>> {
    let selectQuery = `SELECT * FROM activity_type`;
    const countQuery = `SELECT COUNT(*) FROM activity_type;`;

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

    const items: ActivityTypeDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
  }

  async get(id: number): Promise<ActivityTypeDTO> {
    const result = await this.database.query(
      `SELECT * FROM activity_type WHERE id = ${id};`,
    );
    const item = result?.values?.[0];

    if (!item)
      throw new NotFoundError(`Not found activity_type with id ${id}.`);

    return item;
  }

  async create(name: string, color?: string, icon?: string): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO activity_type (created_at, updated_at, name, color, icon)
      VALUES ("${nowIsoString()}", "${nowIsoString()}", "${name}", "${color}", "${icon}") RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(
    id: number,
    name: string,
    color?: string,
    icon?: string,
  ): Promise<void> {
    await this.database.query(
      `UPDATE activity_type
      SET updated_at = "${nowIsoString()}", name = "${name}", color = "${color}", icon = "${icon}"
      WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(`DELETE FROM activity_type WHERE id = ${id};`);
  }
}
