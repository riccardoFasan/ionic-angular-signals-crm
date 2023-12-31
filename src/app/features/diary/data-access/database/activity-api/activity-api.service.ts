import { Injectable, inject } from '@angular/core';
import { DatabaseService, List, nowIsoString } from 'src/app/shared/utility';
import { ActivityDTO } from '../activity.dto';

@Injectable({
  providedIn: 'root',
})
export class ActivityApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS activity (
        id INTEGER PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        name TEXT NOT NULL,
        at TEXT NOT NULL,
        notes TEXT,
        activity_type_id INTEGER NOT NULL,
        FOREIGN KEY (activity_type_id) REFERENCES activity_type (id)
      );
    `);
  }

  async getList(page: number, pageSize: number): Promise<List<ActivityDTO>> {
    const offset = (page - 1) * pageSize;

    const listResult = await this.database.query(
      `SELECT * FROM activity
      LIMIT ${pageSize} OFFSET ${offset};`,
    );

    const countResult = await this.database.query(
      `SELECT COUNT(*) FROM activity;`,
    );

    const items: ActivityDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { page, pageSize, total, items };
  }

  async get(id: number): Promise<ActivityDTO> {
    const result = await this.database.query(
      `SELECT * FROM activity WHERE id = ${id};`,
    );
    const item = result?.values?.[0];

    if (!item) throw new Error(`Not found activity with id ${id}.`);

    return item;
  }

  async create(
    name: string,
    at: string,
    activityTypeId: number,
    notes?: string,
  ): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO activity (created_at, updated_at, name, at, notes, activity_type_id)
      VALUES ("${nowIsoString()}", "${nowIsoString()}", "${name}", "${at}", "${notes}", ${activityTypeId}) RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(
    id: number,
    name: string,
    at: string,
    activityTypeId: number,
    notes?: string,
  ): Promise<void> {
    await this.database.query(
      `UPDATE activity
      SET updated_at = "${nowIsoString()}", name = "${name}", at = "${at}", notes = "${notes}", activity_type_id = ${activityTypeId}
      WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(`DELETE FROM activity WHERE id = ${id};`);
  }
}
