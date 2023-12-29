import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class ActivityTagApiService {
  private database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS activity_tag (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        activity_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activity (id),
        FOREIGN KEY (tag_id) REFERENCES tag (id)
      );`);
  }

  async getByActivity(activityId: number): Promise<number[]> {
    const result = await this.database.query(`
      SELECT tag_id FROM activity_tag WHERE activity_id = ${activityId};
    `);
    return result.values || [];
  }

  async getByTag(tagId: number): Promise<number[]> {
    const result = await this.database.query(`
      SELECT activity_id FROM activity_tag WHERE tag_id = ${tagId};  
    `);
    return result.values || [];
  }

  async create(activityId: number, tagId: number): Promise<void> {
    await this.database.query(`
      INSERT INTO activity_tag (created_at, updated_at, activity_id, tag_id)
      VALUES (datetime('now'), datetime('now'), ${activityId}, ${tagId});
    `);
  }

  async delete(activityId: number, tagId: number): Promise<void> {
    await this.database.query(`
      DELETE FROM activity_tag
      WHERE activity_id = ${activityId} AND tag_id = ${tagId};
    `);
  }
}
