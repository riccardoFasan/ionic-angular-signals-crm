import { Injectable, inject } from '@angular/core';
import {
  DatabaseService,
  List,
  NotFoundError,
  nowIsoString,
} from 'src/app/shared/utility';
import { TagDTO } from '../tag.dto';

@Injectable({
  providedIn: 'root',
})
export class TagApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS tag (
        id INTEGER PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT
      );
    `);
  }

  async getList(pageIndex: number, pageSize: number): Promise<List<TagDTO>> {
    const offset = pageIndex * pageSize;

    const listResult = await this.database.query(
      `SELECT * FROM tag
      LIMIT ${pageSize} OFFSET ${offset};`,
    );

    const countResult = await this.database.query(`SELECT COUNT(*) FROM tag;`);

    const items: TagDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
  }

  async get(id: number): Promise<TagDTO> {
    const result = await this.database.query(
      `SELECT * FROM tag WHERE id = ${id};`,
    );
    const item = result?.values?.[0];

    if (!item) throw new NotFoundError(`Not found tag with id ${id}.`);

    return item;
  }

  async create(name: string, color?: string): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO tag (created_at, updated_at, name, color)
      VALUES ("${nowIsoString()}", "${nowIsoString()}", "${name}", "${color}") RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(id: number, name: string, color?: string): Promise<void> {
    await this.database.query(
      `UPDATE tag SET updated_at = "${nowIsoString()}", name = "${name}", color = "${color}" WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(`DELETE FROM tag WHERE id = ${id};`);
  }
}
