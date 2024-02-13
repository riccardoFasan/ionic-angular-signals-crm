import { Injectable, inject } from '@angular/core';
import {
  DatabaseService,
  NotFoundError,
  List,
  nowIsoString,
  SearchCriteria,
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

  async getList(searchCriteria: SearchCriteria): Promise<List<IngredientDTO>> {
    let selectQuery = `SELECT * FROM ingredient`;
    const countQuery = `SELECT COUNT(*) FROM ingredient;`;

    const { filters, sortings } = searchCriteria;

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

    const items: IngredientDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
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
