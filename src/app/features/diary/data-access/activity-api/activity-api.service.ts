import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/shared/utility';

@Injectable({
  providedIn: 'root',
})
export class ActivityApiService {
  private readonly database = inject(DatabaseService);

  async createTable(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS activity (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        at DATETIME NOT NULL,
        notes TEXT,
        activity_type_id INTEGER NOT NULL,
        FOREIGN KEY (activity_type_id) REFERENCES activity_type (id)
      );
    `);
  }

  // async createTable(): Promise<void> {
  //   await this.database.query(`
  //     CREATE TABLE IF NOT EXISTS activity_tags (
  //       id INTEGER PRIMARY KEY,
  //       created_at DATETIME NOT NULL,
  //       updated_at DATETIME NOT NULL,
  //       activity_id INTEGER NOT NULL,
  //       tag_id INTEGER NOT NULL,
  //       FOREIGN KEY (activity_id) REFERENCES activity (id),
  //       FOREIGN KEY (tag_id) REFERENCES tag (id)
  //     );`);
  // }
}
