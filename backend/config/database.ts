import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Fix untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env dari root folder (2 level di atas config/)
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Ambil DB_PATH dari .env, default ke '../database/foodmap.db' jika tidak ada
const dbPathEnv = process.env.DB_PATH || '../database/foodmap.db';

// Resolve path agar selalu benar relatif terhadap ROOT folder proyek
// Kita hapus './' di depan jika ada, lalu gabungkan dengan root directory
const rootDir = path.join(__dirname, '../../');
const cleanDbPath = dbPathEnv.replace('./', '').replace('.\\', '');
const resolvedDbPath = path.join(rootDir, cleanDbPath);

console.log('✅ Database path resolved to:', resolvedDbPath);

// Inisialisasi database
const db = new Database(resolvedDbPath);

// Aktifkan foreign keys
db.exec('PRAGMA foreign_keys = ON');

export default db;