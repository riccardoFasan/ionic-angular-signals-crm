import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  async execute(statement: string): Promise<any> {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const dbSettings = environment.database;

    const database = await sqlite.createConnection(
      dbSettings.name,
      dbSettings.encrypted,
      dbSettings.mode,
      dbSettings.version,
      dbSettings.readonly
    );

    await database.open();
    const { changes } = await database.execute(statement);
    await database.close();
    await sqlite.closeConnection(dbSettings.name, dbSettings.readonly);

    return changes?.values;
  }
}
