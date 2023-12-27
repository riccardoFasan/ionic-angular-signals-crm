import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private database?: SQLiteDBConnection;

  private async initDatabase(): Promise<void> {
    const dbSettings = environment.database;
    this.database = await this.sqlite.createConnection(
      dbSettings.name,
      dbSettings.encrypted,
      dbSettings.mode,
      dbSettings.version,
      dbSettings.readonly
    );

    await this.database.open();
  }

  private async defineTables(): Promise<void> {
    this.ensureDatabase();

    const activityAndRelated = Promise.all([
      this.defineTag(),
      this.defineActivityType(),
      this.defineActivity(),
      this.defineActivityTags(),
    ]);

    const foodAndRelated = Promise.all([
      this.defineIngredient(),
      this.defineFood(),
      this.defineFoodIngredients(),
      this.defineMeal(),
      this.defineMealFoods(),
    ]);

    await Promise.all([activityAndRelated, foodAndRelated]);
  }

  private async defineTag(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
      CREATE TABLE IF NOT EXISTS tag (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        color TEXT
      );
    `);
  }

  private async defineActivityType(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
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

  private async defineActivity(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
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

  private async defineActivityTags(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
      CREATE TABLE IF NOT EXISTS activity_tags (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        activity_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activity (id),
        FOREIGN KEY (tag_id) REFERENCES tag (id)
      );`);
  }

  private async defineIngredient(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
      CREATE TABLE IF NOT EXISTS ingredient (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  private async defineFood(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
      CREATE TABLE IF NOT EXISTS food (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  private async defineFoodIngredients(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
      CREATE TABLE IF NOT EXISTS food_ingredients (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        food_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        FOREIGN KEY (food_id) REFERENCES food (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredient (id)
      );`);
  }

  private async defineMeal(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
      CREATE TABLE IF NOT EXISTS meal (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        at DATETIME NOT NULL,
        name TEXT NOT NULL,
        notes TEXT
      );`);
  }

  private async defineMealFoods(): Promise<void> {
    this.ensureDatabase();
    await this.database?.execute(`
      CREATE TABLE IF NOT EXISTS meal_foods (
        id INTEGER PRIMARY KEY,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        meal_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        FOREIGN KEY (meal_id) REFERENCES meal (id),
        FOREIGN KEY (food_id) REFERENCES food (id)
      );`);
  }

  private ensureDatabase(): void {
    if (!this.database) throw new Error('Database not initialized');
  }
}
