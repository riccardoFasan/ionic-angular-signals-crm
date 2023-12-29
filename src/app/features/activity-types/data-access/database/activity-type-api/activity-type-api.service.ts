import { Injectable, inject } from '@angular/core';
import { DatabaseService, List, NotFoundError } from 'src/app/shared/utility';
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
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT
      );
    `);
  }

  async getList(
    page: number,
    pageSize: number,
  ): Promise<List<ActivityTypeDTO>> {
    const offset = (page - 1) * pageSize;

    const listResult = await this.database.query(
      `SELECT * FROM activity_type
      LIMIT ${pageSize} OFFSET ${offset};`,
    );

    const countResult = await this.database.query(
      `SELECT COUNT(*) FROM activity_type;`,
    );

    const items: ActivityTypeDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { page, pageSize, total, items };
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
      VALUES (datetime('now'), datetime('now'), "${name}", "${color}", "${icon}") RETURNING *;`,
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
      SET updated_at = datetime('now'), name = "${name}", color = "${color}", icon = "${icon}"
      WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(`DELETE FROM activity_type WHERE id = ${id};`);
  }
}
