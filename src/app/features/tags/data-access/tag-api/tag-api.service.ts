import { Injectable, inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/data-access';

@Injectable({
  providedIn: 'root',
})
export class TagApiService {
  private readonly database = inject(DatabaseService);

  async createTagTable(): Promise<void> {
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS tag (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        color TEXT
      );
    `);
  }
}
