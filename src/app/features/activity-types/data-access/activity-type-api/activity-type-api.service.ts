import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/data-access';

@Injectable({
  providedIn: 'root',
})
export class ActivityTypeApiService {
  private readonly database = inject(DatabaseService);

  async createActivityTypeTable(): Promise<void> {
    await this.database.execute(`
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
}