import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  DBSQLiteValues,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private database?: SQLiteDBConnection;

  async createConnection(): Promise<void> {
    const dbSettings = environment.database;

    const { result: hasConnection } =
      await this.sqlite.checkConnectionsConsistency();

    if (hasConnection) {
      this.database = await this.sqlite.retrieveConnection(
        dbSettings.name,
        dbSettings.readonly
      );
      return;
    }

    this.database = await this.sqlite.createConnection(
      dbSettings.name,
      dbSettings.encrypted,
      dbSettings.mode,
      dbSettings.version,
      dbSettings.readonly
    );

    await this.database.open();
  }

  async closeConnection(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    await this.database.close();
  }

  async query(statement: string): Promise<DBSQLiteValues> {
    if (!this.database) throw new Error('Database not initialized');
    return await this.database!.query(statement);
  }
}
