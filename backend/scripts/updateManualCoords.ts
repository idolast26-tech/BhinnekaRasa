import db from '../config/database.js';

const manualCoords: Record<string, { lat: number; lng: number }> = {
  'Soto Bening Khas Medan H Anwar Sulaiman': { lat: 3.5776902851286176, lng: 98.68456979549899 },
  'CI CIONG FAN - AHAN': { lat: 3.5899958583314433, lng: 98.69255091824671 },
  'Bika Ambon Ahun': { lat: 3.5942817355860917, lng: 98.66675409633903 },
  'Rumah Makan Tabona': { lat: 3.581917298811691, lng: 98.6815086251744 },
  'Restoran Kari Bihun Medan Mbak Ayu': { lat: 3.5837346221062036, lng: 98.65087569633894 }
};

const update = db.prepare('UPDATE restaurants SET latitude = ?, longitude = ? WHERE name = ?');

for (const [name, coord] of Object.entries(manualCoords)) {
  const result = update.run(coord.lat, coord.lng, name);
  if (result.changes > 0) {
    console.log(`✅ ${name} → ${coord.lat}, ${coord.lng}`);
  } else {
    console.log(`⚠️  ${name} tidak ditemukan di database (cek nama persis sama?)`);
  }
}

console.log('🎉 Selesai update koordinat manual.');