import { Injectable, inject } from '@angular/core';
import {
  DatabaseService,
  List,
  NotFoundError,
  SearchCriteria,
  nowIsoString,
} from 'src/app/shared/utility';
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
        end TEXT,
        notes TEXT,
        activity_type_id INTEGER NOT NULL,
        FOREIGN KEY (activity_type_id) REFERENCES activity_type (id)
      );
    `);
  }

  async getList(searchCriteria: SearchCriteria): Promise<List<ActivityDTO>> {
    let selectQuery = `SELECT * FROM activity`;
    const countQuery = `SELECT COUNT(*) FROM activity;`;

    const { filters, sorting } = searchCriteria;
    if (filters) {
      const filterClauses = Object.entries(filters)
        .reduce((clauses: string[], [field, value]) => {
          if (value !== undefined)
            return [...clauses, `${field} LIKE '%${value}%'`];
          return clauses;
        }, [])
        .join(' AND ');
      if (filterClauses) selectQuery += ` WHERE ${filterClauses}`;
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

    const items: ActivityDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
  }

  async get(id: number): Promise<ActivityDTO> {
    const result = await this.database.query(
      `SELECT * FROM activity WHERE id = ${id};`,
    );
    const item = result?.values?.[0];

    if (!item) throw new NotFoundError(`Not found activity with id ${id}.`);

    return item;
  }

  async create(
    name: string,
    at: string,
    activityTypeId: number,
    notes?: string,
    end?: string,
  ): Promise<number> {
    const result = await this.database.query(
      `INSERT INTO activity (created_at, updated_at, name, at, end, notes, activity_type_id)
      VALUES ("${nowIsoString()}", "${nowIsoString()}", "${name}", "${at}", "${end}", "${notes}", ${activityTypeId}) RETURNING *;`,
    );
    return result.values?.[0].id;
  }

  async update(
    id: number,
    name: string,
    at: string,
    activityTypeId: number,
    notes?: string,
    end?: string,
  ): Promise<void> {
    await this.database.query(
      `UPDATE activity
      SET updated_at = "${nowIsoString()}", name = "${name}", at = "${at}", end = "${end}" notes = "${notes}", activity_type_id = ${activityTypeId}
      WHERE id = ${id};`,
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.query(`DELETE FROM activity WHERE id = ${id};`);
  }
}
