import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'nrexam.db');
export const db = new Database(dbPath);

// Run migrations
export function initDB() {
  const migrationsDir = path.join(process.cwd(), 'backend/auth/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  for (const file of migrationFiles) {
    if (file.endsWith('.sql')) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      db.exec(sql);
    }
  }
  console.log('Database initialized and migrations applied.');
}
