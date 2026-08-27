import db from '../config/database.js';

interface MenuItemRow {
  id: number;
  name: string;
  rating: number;
}

function dedupe() {
  const items = db.prepare('SELECT id, name, rating FROM menu_items ORDER BY name, rating DESC').all() as MenuItemRow[];

  const seen = new Set<string>();
  const idsToDelete: number[] = [];

  for (const item of items) {
    if (seen.has(item.name)) {
      idsToDelete.push(item.id);
    } else {
      seen.add(item.name);
    }
  }

  if (idsToDelete.length === 0) {
    console.log('Tidak ada duplikat ditemukan.');
    return;
  }

  const del = db.prepare('DELETE FROM menu_items WHERE id = ?');
  for (const id of idsToDelete) {
    del.run(id);
  }

  console.log(`✅ ${idsToDelete.length} baris duplikat dihapus.`);
  console.log(`🎉 Tersisa ${seen.size} menu item unik (1 per jenis kuliner, diambil dari restoran rating tertinggi).`);
}

dedupe();