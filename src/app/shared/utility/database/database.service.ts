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

  async encryptSqliteConnection(secret: string): Promise<void> {
    if (this.database) {
      throw new Error('Database should be not initialized at this point');
    }
    if (environment.production && environment.database.encrypted) {
      const isSecretStored = (await this.sqlite.isSecretStored()).result;
      if (!isSecretStored) await this.sqlite.setEncryptionSecret(secret);
    }
  }

  async createDatabaseConnection(): Promise<void> {
    const dbSettings = environment.database;

    const { result: hasConnection } =
      await this.sqlite.checkConnectionsConsistency();

    const { result: isConnected } = await this.sqlite.isConnection(
      dbSettings.name,
      dbSettings.readonly,
    );

    if (hasConnection && isConnected) {
      this.database = await this.sqlite.retrieveConnection(
        dbSettings.name,
        dbSettings.readonly,
      );
      return;
    }

    this.database = await this.sqlite.createConnection(
      dbSettings.name,
      dbSettings.encrypted,
      dbSettings.mode,
      dbSettings.version,
      dbSettings.readonly,
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
