import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
const dbPathEnv = process.env.DB_PATH || '../database/foodmap.db';

const rootDir = path.join(__dirname, '../../');
const cleanDbPath = dbPathEnv.replace('./', '').replace('.\\', '');
const resolvedDbPath = path.join(rootDir, cleanDbPath);

console.log('✅ Database path resolved to:', resolvedDbPath);
const seedDbPath = path.join(__dirname, '../seed/foodmap.seed.db');

if (!fs.existsSync(resolvedDbPath) && fs.existsSync(seedDbPath)) {
  console.log('⚠️  Database belum ada di volume, menyalin data awal dari seed...');
  fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });
  fs.copyFileSync(seedDbPath, resolvedDbPath);
  console.log('✅ Data awal berhasil disalin ke:', resolvedDbPath);
}

const db = new Database(resolvedDbPath);

// Aktifkan foreign keys
db.exec('PRAGMA foreign_keys = ON');

export default db;
