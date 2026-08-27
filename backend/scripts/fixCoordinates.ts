import axios from 'axios';
import db from '../config/database.js';

interface RestoRow {
  id: number;
  name: string;
  address: string;
}

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'KulinerMedanFood/1.0 (kontak: okysihotang10@gmail.com)'
  }
});

async function tryGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await axiosInstance.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'jsonv2', limit: 1, countrycodes: 'id' }
    });
    const results = res.data;
    if (results && results.length > 0) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    }
    return null;
  } catch (e) {
    console.error('Geocode error:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fix() {
  const restaurants = db
    .prepare('SELECT id, name, address FROM restaurants WHERE latitude = 0 AND longitude = 0')
    .all() as RestoRow[];

  console.log(`Ditemukan ${restaurants.length} restoran tanpa koordinat.\n`);

  const update = db.prepare('UPDATE restaurants SET latitude = ?, longitude = ? WHERE id = ?');

  for (const r of restaurants) {
    console.log(`🔍 ${r.name}`);
    let coords: { lat: number; lng: number } | null = null;

    // Strategi 1: nama restoran + Medan (paling sering berhasil, karena banyak resto terdaftar di OSM by name)
    coords = await tryGeocode(`${r.name}, Medan, Indonesia`);
    await delay(1100);

    // Strategi 2: kalau gagal, ambil bagian jalan saja (sebelum koma pertama) + Medan
    if (!coords) {
      const streetPart = r.address.split(',')[0] || r.address;
      coords = await tryGeocode(`${streetPart}, Medan, Indonesia`);
      await delay(1100);
    }

    // Strategi 3: kalau masih gagal, ambil 2 segmen pertama dari alamat + Medan
    if (!coords) {
      const parts = r.address.split(',').slice(0, 2).join(',');
      coords = await tryGeocode(`${parts}, Medan, Indonesia`);
      await delay(1100);
    }

    if (coords) {
      update.run(coords.lat, coords.lng, r.id);
      console.log(`  ✅ Ditemukan: ${coords.lat}, ${coords.lng}\n`);
    } else {
      console.log(`  ❌ Tetap tidak ditemukan, biarkan 0,0 (bisa diisi manual nanti)\n`);
    }
  }

  console.log('🎉 Selesai memperbaiki koordinat.');
}

fix();