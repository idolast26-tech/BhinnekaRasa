import db from '../config/database.js';

const newColumns = [
  'description TEXT',
  'price INTEGER',
  'image TEXT',
  'category TEXT',
  'is_popular INTEGER DEFAULT 0',
  'journey TEXT',
  'spices TEXT'
];
for (const col of newColumns) {
  try {
    db.exec(`ALTER TABLE dishes ADD COLUMN ${col};`);
    console.log(`✅ Kolom ditambahkan: ${col}`);
  } catch (e) {
    console.log(`⏭️  Kolom sudah ada, skip: ${col}`);
  }
}

interface DishFull {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular: boolean;
  journey: string;
  spices: string[];
  ingredients: string[];
  nutrition: { calories: string; fat: string; carbs: string; protein: string; other?: string };
}

const dishes: DishFull[] = [
  {
    name: 'Soto Medan',
    description: 'Soto dengan kuah santan kental, perpaduan Melayu dan Tionghoa yang kaya rempah',
    price: 37500,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    category: 'Soup',
    isPopular: true,
    journey: 'Soto pertama kali populer di Semarang pada abad 19 karena banyaknya pedagang Tionghoa di pelabuhan. Makanan cepat saji seperti Caudo menjadi pilihan praktis dan mengenyangkan. Dari Semarang, soto menyebar ke berbagai daerah di Indonesia termasuk Medan, dan mengalami modifikasi sesuai bahan dan budaya lokal. Bumbu lokal seperti kunyit, serai, kemiri, dan santan ditambahkan. Karena penduduk Jawa umumnya Muslim, daging babi diganti dengan ayam, sapi, atau kerbau.',
    spices: ['Bawang putih (4 siung)', 'Bawang merah (6 butir)', 'Kemiri sangrai (3 butir)', 'Kunyit bakar (2cm)', 'Jahe (1cm)', 'Lengkuas (1cm)', 'Ketumbar bubuk (1 sdt)', 'Merica bubuk (½ sdt)', 'Serai geprek (2 batang)', 'Daun jeruk (3 lembar)', 'Daun salam (2 lembar)', 'Santan cair (200ml)'],
    ingredients: ['500g daging ayam (paha/dada)', '200ml santan cair', '2 batang serai', '3 lembar daun jeruk', '2 lembar daun salam', '1 liter air', '4 siung bawang putih', '6 butir bawang merah', '3 butir kemiri', '2cm kunyit', '1cm jahe', '1cm lengkuas', 'Perkedel kentang', 'Telur rebus', 'Emping goreng', 'Sambal rawit'],
    nutrition: { calories: '312 kkal', fat: '14,29 gram', carbs: '19,55 gram', protein: '24,01 gram', other: 'Serat: 1,7g | Gula: 0,98g | Sodium: 210mg | Kalium: 298mg' }
  },
  {
    name: 'Ci Cong Fan',
    description: 'Gulungan mi beras khas Kanton yang disiram saus gurih, hasil akulturasi Tionghoa-Medan',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    category: 'Traditional',
    isPopular: true,
    journey: 'Ci Cong Fan berasal dari daerah Kanton, Provinsi Guangdong, Cina Selatan dan Hong Kong. Dalam dialek Kanton, "jyu" berarti babi, "cheung" berarti usus, dan "fan" berarti mie — dinamai demikian karena bentuk gulungannya mirip usus babi. Pada akhir abad ke-19 hingga awal abad ke-20, migrasi besar etnis Tionghoa ke Medan membawa tradisi kuliner ini. Di Medan terjadi lokalisasi rasa: isian berubah dari babi panggang merah menjadi ebi, udang segar, atau polos. Sausnya pun beradaptasi dengan perpaduan kecap asin, minyak wijen, minyak bawang, saus asam manis, dan kaldu gurih.',
    spices: ['Kecap asin gurih', 'Minyak wijen', 'Minyak bawang', 'Saus asam manis pedas', 'Kaldu daging', 'Bawang goreng', 'Wijen putih'],
    ingredients: ['Lembaran tepung beras (tang mien)', 'Ebi / udang segar', 'Sayuran segar', 'Kecap asin gurih', 'Minyak wijen', 'Minyak bawang', 'Saus asam manis', 'Bawang goreng', 'Wijen', 'Siomay (pendamping)', 'Lumpia isi sayur (pendamping)', 'Gorengan uyen/talas (pendamping)'],
    nutrition: { calories: '110 kkal', fat: '2,20 gram', carbs: '21,00 gram', protein: '1,30 gram', other: 'Per 100 gram gulungan mi beras (tanpa topping)' }
  },
  {
    name: 'Bika Ambon',
    description: 'Kue tradisional Medan dengan tekstur bersarang khas, hasil akulturasi Melayu dan Tionghoa',
    price: 87500,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
    category: 'Dessert',
    isPopular: true,
    journey: 'Bika Ambon lahir dari kreativitas masyarakat Kota Medan melalui percampuran resep Bingka Melayu dengan teknik fermentasi Tionghoa. Popularitasnya mencapai puncak pada era 1970-1980an. Bermula di Jalan Ambon, para pengusaha kemudian menjadikan Jalan Mojopahit sebagai sentra resmi oleh-oleh Bika Ambon di Medan karena lokasinya yang strategis untuk penjualan oleh-oleh.',
    spices: ['Kunyit bubuk (1 sdt)', 'Serai geprek (2 batang)', 'Daun jeruk (5-7 lembar)', 'Daun pandan (3 lembar)', 'Ragi instan (8g)', 'Santan kental', 'Butter/margarin'],
    ingredients: ['Tepung tapioka (180g)', 'Tepung ketan (20g)', '8 kuning telur + 2 telur utuh', 'Gula pasir (180g, blender halus)', 'Santan kental (200ml)', 'Air (200ml)', 'Kunyit bubuk (1 sdt)', 'Serai geprek (2 batang)', 'Daun jeruk (5-7 lembar)', 'Daun pandan (3 lembar)', 'Garam (½ sdt)', 'Butter/margarin (20g)', 'Ragi instan (2 sdt/8g)', 'Terigu biang (10g)', 'Gula biang (13g)', 'Air hangat biang (100ml)'],
    nutrition: { calories: '185 kkal', fat: '3,11 gram', carbs: '37,34 gram', protein: '2,18 gram', other: 'Rincian: 15% lemak | 80% karbohidrat | 5% protein' }
  },
  {
    name: 'Kari Bihun',
    description: 'Perpaduan bihun Tionghoa dengan kuah kari India-Melayu, kuning keemasan dan kaya rempah',
    price: 62500,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
    category: 'Noodles',
    isPopular: true,
    journey: 'Kari Bihun berkembang di Medan pada akhir abad ke-19 hingga awal abad ke-20, saat Medan menjadi pusat perdagangan dan perkebunan Sumatra Timur. Pedagang Tionghoa membawa bihun, sementara masyarakat India memperkenalkan kari kaya rempah. Melalui interaksi dengan masyarakat Melayu setempat, keduanya berpadu hingga menjadi kari bihun Medan. Seiring waktu, hidangan ini diwariskan dari generasi ke generasi dan dikenal sebagai salah satu makanan khas Medan.',
    spices: ['Kunyit bakar', 'Ketumbar', 'Jintan', 'Bawang merah & bawang putih', 'Jahe', 'Serai', 'Kayu manis', 'Cengkeh', 'Kapulaga', 'Bunga lawang', 'Daun kari', 'Bubuk kari', 'Santan'],
    ingredients: ['Ayam ½ ekor (potong-potong)', 'Kentang 2 buah (potong kotak)', 'Santan kental 400ml', 'Santan encer 1 liter', 'Kayu manis 3cm', 'Cengkeh 4 biji', 'Kapulaga 2 buah', 'Bunga lawang 1 buah', 'Daun kari 10 lembar', 'Serai 2 batang', 'Bubuk kari 1 sdm', 'Cabe merah keriting 5 buah', 'Cabe merah kering 3 buah', 'Bawang merah 6 siung', 'Bawang putih 3 siung', 'Kemiri sangrai 3 butir', 'Kunyit bakar 1 ruas', 'Bihun matang 200g', 'Bawang goreng'],
    nutrition: { calories: '~350–450 gram per porsi', fat: '20–28 gram', carbs: '55–65 gram', protein: '20–30 gram', other: 'Natrium: 0,8–1,2g | Kalium: 300–450mg | Zat Besi: 2–3,5mg | Kalsium: 30–50mg | Vit B Kompleks: 0,2–1,5mg' }
  },
  {
    name: 'Bolu Meranti',
    description: 'Bolu gulung lembut khas Medan dengan isian keju, meses, atau selai nanas — oleh-oleh ikonik sejak 1970-an',
    price: 87500,
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80',
    category: 'Dessert',
    isPopular: true,
    journey: 'Bolu Meranti merupakan bentuk akulturasi kuliner antara budaya Eropa dan Tionghoa di Kota Medan. Bolu gulung (sponge cake) dan penggunaan mentega (butter) diperkenalkan oleh bangsa Belanda pada masa kolonial. Teknik baking ala Barat ini diadopsi dan dimodifikasi oleh masyarakat Tionghoa-Medan, khususnya Nyonya Ai Ling. Tekstur kue disesuaikan menjadi lebih padat dan lembut sesuai selera lokal. Perpaduan global-lokal terlihat pada isiannya: keju khas Barat dikombinasikan dengan meses cokelat dan selai nanas yang akrab di lidah Indonesia.',
    spices: ['Margarin berkualitas tinggi (120g)', 'Esens vanila', 'SP/ovalet (1 sdt)', 'Susu bubuk (30g)', 'Maizena (20g)', 'Gula pasir (110g)'],
    ingredients: ['9 kuning telur', '3 putih telur', '110g gula pasir', '1 sdt SP (ovalet)', '75g tepung terigu protein sedang', '20g maizena', '30g susu bubuk', '120g margarin (lelehkan)', 'Isian: keju / meses cokelat / selai nanas'],
    nutrition: { calories: '430 kkal', fat: '32 gram', carbs: '28 gram', protein: '8 gram', other: 'Per potong ±100g (varian keju)' }
  }
];

const update = db.prepare(`
  UPDATE dishes SET
    description = ?, price = ?, image = ?, category = ?, is_popular = ?,
    journey = ?, spices = ?, ingredients = ?, nutrition = ?
  WHERE name = ?
`);

for (const d of dishes) {
  const res = update.run(
    d.description, d.price, d.image, d.category, d.isPopular ? 1 : 0,
    d.journey, JSON.stringify(d.spices), JSON.stringify(d.ingredients), JSON.stringify(d.nutrition),
    d.name
  );
  console.log(res.changes > 0 ? `✅ Data diupdate: ${d.name}` : `⚠️  Tidak ditemukan: ${d.name}`);
}

console.log('🎉 Selesai! Cek tabel dishes di DB Browser sekarang.');