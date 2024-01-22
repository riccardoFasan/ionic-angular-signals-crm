import { Injectable, inject } from '@angular/core';
import { DatabaseService, List, SearchCriteria } from 'src/app/shared/utility';
import { DiaryEventDTO } from '../diary-event.dto';

@Injectable({
  providedIn: 'root',
})
export class DiaryApiService {
  private database = inject(DatabaseService);

  async getList(searchCriteria: SearchCriteria): Promise<List<DiaryEventDTO>> {
    let selectQuery = `SELECT * FROM (
      SELECT meal.id, meal.created_at, meal.updated_at, meal.name, meal.at, NULL as icon, NULL as color, 'MEAL' as type FROM meal
      UNION ALL
      SELECT activity.id, activity.created_at, activity.updated_at, activity.name, activity.at, activity_type.icon, activity_type.color, 'ACTIVITY' as type
      FROM activity JOIN activity_type ON activity.activity_type_id = activity_type.id
    ) AS diary_events`;

    const countQuery = `SELECT COUNT(*) FROM (
      SELECT meal.id FROM meal
      UNION ALL
      SELECT activity.id FROM activity
    ) AS diary_events`;

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

    const items: DiaryEventDTO[] = listResult.values || [];
    const total = countResult.values?.[0]['COUNT(*)'] || 0;

    return { pageIndex, pageSize, total, items };
  }
}