import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

// Fix untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env dari ROOT folder (2 level di atas scripts/)
// scripts/ -> backend/ -> root/
const envPath = path.join(__dirname, '../../.env');
console.log(' Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Cek apakah DB_PATH terbaca
const dbPath = process.env.DB_PATH;
if (!dbPath) {
  console.error('❌ DB_PATH tidak ditemukan di file .env!');
  process.exit(1);
}

// Resolve path database (relatif terhadap root folder)
const resolvedDbPath = path.join(__dirname, '../../', dbPath);
console.log(' Database path:', resolvedDbPath);

// Koneksi ke database
const db = new Database(resolvedDbPath);

async function resetAdmin() {
  const email = 'admin@kulinermedan.com';
  const password = 'admin123';
  
  try {
    // Generate hash yang 100% valid dengan bcryptjs
    const hash = await bcrypt.hash(password, 10);
    console.log(' Generated hash:', hash);
    
    // Cek apakah user sudah ada
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    
    if (existing) {
      // Update password dan role
      db.prepare(`
        UPDATE users 
        SET password_hash = ?, role = 'admin' 
        WHERE email = ?
      `).run(hash, email);
      console.log('✅ User admin berhasil diupdate!');
    } else {
      // Buat user baru
      db.prepare(`
        INSERT INTO users (username, email, password_hash, role, created_at)
        VALUES ('admin', ?, ?, 'admin', datetime('now'))
      `).run(email, hash);
      console.log('✅ User admin baru berhasil dibuat!');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' Email:    admin@kulinermedan.com');
    console.log(' Password: admin123');
    console.log(' Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' Silakan login sekarang!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

resetAdmin();