// backend/scripts/seedKulinerData.ts
import db from '../config/database.js';
import googleMaps from '../services/googleMaps.js'; // sekarang berbasis Nominatim

interface RestoData {
  name: string;
  address: string;
  rating: number;
  priceLevel: string;
}

interface DishData {
  name: string;
  history: string;
  ingredients: string;
  nutrition: string;
  restaurants: RestoData[];
}

const dishes: DishData[] = [
  {
    name: 'Soto Medan',
    history: 'Istilah "soto" merujuk dari makanan Tionghoa yang dalam dialek Hokkian disebut cau do/jao to, artinya jeroan dengan rempah-rempah. Soto pertama kali dikenal di pesisir utara Jawa abad ke-19, lalu populer di Semarang karena banyak pedagang Tionghoa di pelabuhan, kemudian menyebar dan dimodifikasi sesuai budaya lokal.',
    ingredients: 'Kuah kaldu berbumbu jahe, bawang putih, merica, garam, ditambah kunyit, serai, daun salam, daun jeruk, kemiri, dan santan. Daging babi diganti ayam/sapi/kerbau karena mayoritas penduduk Muslim.',
    nutrition: '312 kkal, 14.29g lemak, 19.55g karbohidrat, 24.01g protein, 1.7g serat, 0.98g gula, 210mg sodium, 298mg kalium (per porsi)',
    restaurants: [
      { name: 'Rumah Makan Sinar Pagi', address: 'No. 2D/1, Jl. Sei Deli No.2D/1, Silalas, Kec. Medan Barat, Kota Medan, Sumatra Utara, 20236', rating: 4.3, priceLevel: 'Rp 25.000-50.000' },
      { name: 'Soto Bening Khas Medan H Anwar Sulaiman', address: 'Jl. Brigjen Katamso No. 43, A U R, Kec. Medan Maimun, Kota Medan, Sumatra Utara, 20159', rating: 4.5, priceLevel: 'Rp 25.000-50.000' },
      { name: 'NJONJA KOPITIAM & SEAFOOD', address: 'Jl. S. Parman, No. 22-24, Petisah Tengah, Kec. Medan Petisah, Kota Medan, Sumatera Utara, 20112', rating: 4.8, priceLevel: 'Rp 25.000-50.000' }
    ]
  },
  {
    name: 'Ci Cong Fan',
    history: 'Berasal dari Kanton, Cina Selatan dan Hongkong, dalam dialek Kanton disebut jyu cheung fan ("usus babi mie" karena bentuknya digulung). Dibawa imigran Tionghoa (Kanton & Hokkien) ke Asia Tenggara termasuk Medan pada akhir abad 19-20, lalu dilokalisasi isiannya (ebi, udang, polos) dan sausnya (kecap asin, minyak wijen, saus asam manis).',
    ingredients: 'Isian sayuran segar atau daging (sapi/babi), disiram kecap asin, saus asam manis pedas atau kaldu rempah, ditaburi bawang goreng dan wijen.',
    nutrition: '110 kkal, 21g karbohidrat, 2.2g lemak, 1.3g protein (per 100 gram)',
    restaurants: [
      { name: 'Ci Cong Fan ACAI', address: 'Jl. Gandhi, Sei Rengas I, Kec. Medan Kota, Kota Medan, Sumatera Utara 20211', rating: 4.8, priceLevel: '-' },
      { name: 'Ci Cheong Fan Acai Kotacane Yoserizal', address: 'Jl. Kotacane, Sei Renggas I, Kec. Medan Kota, Kota Medan, Sumatera Utara 20211', rating: 4.5, priceLevel: 'Rp 25.000-50.000' },
      { name: 'CI CIONG FAN - AHAN', address: 'Jl. Aip II KS Tubun d/h Sumatera No. 93, Pandau Hulu I, Medan Kota, Kota Medan, Sumatra Utara, 20233', rating: 4.2, priceLevel: '-' }
    ]
  },
  {
    name: 'Bika Ambon',
    history: 'Beberapa versi asal-usul nama: dari Jalan Ambon di Sei Kera tempat kue ini pertama populer; dari istilah lokal "ambon" yang berarti lembut; atau legenda seorang Tionghoa yang membuatnya untuk asisten rumah tangga asal Ambon. Merupakan adaptasi dari kue Melayu (Bingka) dengan tambahan nira, santan, dan ragi. Populer sejak 1970-1980an, sentra oleh-oleh resminya di Jalan Mojopahit.',
    ingredients: 'Santan, kunyit, serai, daun jeruk, daun pandan, ragi instan, kuning telur, gula pasir, tepung tapioka, tepung ketan.',
    nutrition: '185 kkal, 3.11g lemak, 37.34g karbohidrat, 2.18g protein',
    restaurants: [
      { name: 'Bika Ambon Zulaikha', address: 'Jl. Mojopahit No. 70 A-C, Petisah Tengah, Kec. Medan Petisah, Kota Medan, Sumatra Utara, 20112', rating: 4.4, priceLevel: '-' },
      { name: 'Bika Ambon Ahun', address: 'Jl. Sekip No. 9, Sekip, Kec. Medan Petisah, Kota Medan, Sumatra Utara, 20113', rating: 4.2, priceLevel: 'Rp 75.000-175.000' },
      { name: 'Bika Ambon ATI', address: 'Jl. Mojopahit, No. 11J, Petisah Tengah, Kec. Medan Petisah, Kota Medan, Sumatra Utara, 20112', rating: 4.8, priceLevel: 'Rp 75.000-100.000' }
    ]
  },
  {
    name: 'Kari Bihun',
    history: 'Hasil akulturasi budaya: bihun dari tradisi Tionghoa dipadukan dengan kari dari pengaruh India dan Melayu. Berkembang di Medan akhir abad 19-awal 20 saat kota ini jadi pusat perdagangan dan perkebunan di Sumatra Timur, dibawa pedagang Tionghoa dan India yang menetap.',
    ingredients: 'Kunyit, ketumbar, jintan, bawang merah, bawang putih, jahe, serai, santan, kayu manis, cengkeh, kapulaga, bunga lawang, daun kari.',
    nutrition: 'Per porsi (350-450g): 55-65g karbohidrat, 20-30g protein, 20-28g lemak',
    restaurants: [
      { name: 'Rumah Makan Tabona', address: 'Jl. Mangkubumi No.17, A U R, Kec. Medan Maimun, Kota Medan, Sumatera Utara 20212', rating: 4.8, priceLevel: 'Rp 40.000-100.000' },
      { name: 'Kari 168 - Yoserizal', address: 'Jalan Yose Rizal No.110, Medan', rating: 4.9, priceLevel: 'Rp 25.000-50.000' },
      { name: 'Restoran Kari Bihun Medan Mbak Ayu', address: 'Jalan Sei Kapuas No.25AA Medan', rating: 4.9, priceLevel: 'Rp 5.000-63.000' }
    ]
  },
  {
    name: 'Bolu Meranti',
    history: 'Dirintis Ai Ling di Medan tahun 1970-an sebagai kue rumahan, dititipkan di Jalan Meranti (asal nama). Bentuk akulturasi budaya Eropa (teknik bolu gulung ala Belanda) dan Tionghoa. Buka gerai resmi di Jalan Kruing tahun 2005, jadi ikon oleh-oleh Medan.',
    ingredients: 'Kuning telur, putih telur, gula pasir, SP, tepung terigu, maizena, susu bubuk, margarin leleh.',
    nutrition: '430 kkal, 32g lemak, 28g karbohidrat, 8g protein (per potong keju, 100g)',
    restaurants: [
      { name: 'Bolu Meranti', address: 'Jl. Kruing Simpang Razak No.7C, Medan', rating: 4.9, priceLevel: 'Rp 75.000-100.000' }
    ]
  }
];

async function seed() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      history TEXT,
      ingredients TEXT,
      nutrition TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tambah kolom dish_id kalau belum ada (SQLite tidak punya IF NOT EXISTS untuk ALTER)
  try {
    db.exec(`ALTER TABLE restaurants ADD COLUMN dish_id INTEGER REFERENCES dishes(id);`);
  } catch (e) {
    console.log('Kolom dish_id mungkin sudah ada, lanjut...');
  }

  const insertDish = db.prepare(`INSERT INTO dishes (name, history, ingredients, nutrition) VALUES (?, ?, ?, ?)`);
  const insertResto = db.prepare(`
    INSERT OR IGNORE INTO restaurants
    (google_place_id, name, address, latitude, longitude, rating, price_level, dish_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const dish of dishes) {
    const dishResult = insertDish.run(dish.name, dish.history, dish.ingredients, dish.nutrition);
    const dishId = dishResult.lastInsertRowid;
    console.log(`✅ Dish: ${dish.name} (id: ${dishId})`);

    for (const resto of dish.restaurants) {
      console.log(`  🔍 Geocoding: ${resto.name}...`);
      const geoResults = await googleMaps.searchPlaces(resto.address);
      const geo = geoResults[0];

      const lat = geo?.geometry?.location.lat || 0;
      const lng = geo?.geometry?.location.lng || 0;

      if (!geo) console.log(`  ⚠️  Tidak dapat koordinat untuk: ${resto.name}, pakai 0,0`);

      insertResto.run(
        `manual-${resto.name.toLowerCase().replace(/\s+/g, '-')}`,
        resto.name,
        resto.address,
        lat,
        lng,
        resto.rating,
        resto.priceLevel,
        dishId
      );

      // hormati rate limit Nominatim (1 request/detik)
      await new Promise((r) => setTimeout(r, 1100));
    }
  }

  console.log('🎉 Seeding selesai!');
}

seed();