/**
 * Script untuk update koordinat (latitude & longitude) restaurants berdasarkan nama.
 * Jalankan dari root project:
 *   npx tsx backend/scripts/update-coordinates.ts
 */
import Database from "better-sqlite3";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

interface RestaurantRow {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

const UPDATES: { name: string; lat: number; lng: number }[] = [
  { name: "Bolu Meranti", lat: 3.594843655510598, lng: 98.66631529738332 },
  { name: "NJONJA KOPITIAM & SEAFOOD", lat: 3.5910501290883814, lng: 98.67024954614266 },
  { name: "Ci Cong Fan ACAI", lat: 3.583253266725508, lng: 98.68999628905944 },
  { name: "Bika Ambon ATI", lat: 3.589155852005154, lng: 98.66718178514117 },
  { name: "Ci Cheong Fan Acai Kotacane Yoserizal", lat: 3.5816417307933586, lng: 98.68972540823603 },
  { name: "Bika Ambon Zulaikha", lat: 3.587374681774634, lng: 98.66625791160338 },
  { name: "Rumah Makan Sinar Pagi", lat: 3.5925674106426015, lng: 98.67102205367415 },
];

function findDatabaseFile(): string {
  const root = process.cwd();
  const candidates: string[] = [];

  const envPath = process.env.DATABASE_PATH || process.env.DB_PATH;
  if (envPath) candidates.push(path.resolve(root, envPath));

  const dbDir = path.join(root, ".database");
  if (fs.existsSync(dbDir)) {
    for (const f of fs.readdirSync(dbDir).sort()) {
      if (/\.(db|sqlite|sqlite3)$/i.test(f)) candidates.push(path.join(dbDir, f));
    }
  }

  const found = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!found) {
    throw new Error(
      "File database tidak ditemukan. Pastikan ada file .db di folder .database, atau set DATABASE_PATH di .env"
    );
  }
  return found;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function main() {
  const dbFile = findDatabaseFile();
  console.log("📦 Database dipakai:", dbFile);

  const db = new Database(dbFile);
  const rows = db.prepare(
    "SELECT id, name, latitude, longitude FROM restaurants"
  ).all() as RestaurantRow[];

  const update = db.prepare(
    "UPDATE restaurants SET latitude = ?, longitude = ? WHERE id = ?"
  );

  const notFound: string[] = [];

  const applyAll = db.transaction(() => {
    for (const u of UPDATES) {
      const target = normalize(u.name);

      const row =
        rows.find((r) => normalize(r.name) === target) ??
        rows.find((r) => normalize(r.name).includes(target)) ??
        rows.find(
          (r) => normalize(r.name).length >= 8 && target.includes(normalize(r.name))
        );

      if (!row) {
        notFound.push(u.name);
        continue;
      }

      update.run(u.lat, u.lng, row.id);
      console.log(
        `✅ [${row.id}] ${row.name}: (${row.latitude}, ${row.longitude}) → (${u.lat}, ${u.lng})`
      );
    }
  });

  applyAll();

  if (notFound.length > 0) {
    console.warn("\n⚠️  Nama berikut TIDAK ditemukan di tabel restaurants:");
    for (const n of notFound) console.warn("   -", n);
    console.warn("\nDaftar nama restaurant yang ada di database:");
    for (const r of rows) console.warn(`   [${r.id}] ${r.name}`);
  }

  db.close();
  console.log("\n🎉 Selesai!");
}

main();