import db from '../config/database.js';

const dishUpdates = [
  {
    name: 'Soto Medan',
    history: `Istilah "soto" merujuk dari salah satu jenis makanan Tionghoa yang dalam dialek Hokkian disebut cau do, jao to, atau chau tu, yang artinya jeroan dengan rempah-rempah. Di Indonesia, soto pertama kali dikenal di pesisir pantai utara Jawa pada abad ke-19 Masehi, yakni masakan berkuah dengan potongan daging ataupun jeroan. Pada awalnya, penjual soto menjual dagangannya dengan cara memikul saat para pekerja pribumi biasa berjualan di lokasi-lokasi ramai, seperti persimpangan jalan atau pasar. Seiring waktu, soto tidak lagi dijajakan dengan pikulan, melainkan disajikan di kedai atau warung.

Soto pertama kali populer di wilayah Semarang pada abad 19 karena banyaknya pedagang Tionghoa yang berdagang di pelabuhan. Pelabuhan menjadi tempat dengan mobilitas tertinggi pada masa lampau. Karena itu, makanan cepat saji seperti Caudo menjadi pilihan yang praktis dan mengenyangkan. Dari Semarang, soto kemudian menyebar ke berbagai daerah di Indonesia dan mengalami modifikasi sesuai dengan bahan dan budaya lokal.`,
    ingredients: `Bahan Utama:
- 500 gram daging ayam (bagian paha atau dada)
- 200 ml santan cair
- 2 batang serai (geprek)
- 3 lembar daun jeruk
- 2 lembar daun salam
- 1 liter air

Bumbu Halus:
- 4 siung bawang putih
- 6 butir bawang merah
- 3 butir kemiri (sangrai dulu)
- 2 cm kunyit (bakar sebentar)
- 1 cm jahe
- 1 cm lengkuas
- 1 sdt ketumbar bubuk
- ½ sdt merica bubuk

Pelengkap:
- Perkedel kentang, telur rebus, emping goreng, sambal rawit merah, jeruk nipis, daun bawang & seledri, bawang goreng`,
    nutrition: '312 kkal, 14,29 gram lemak, 19,55 gram karbohidrat, 24,01 gram protein, 1,7 gram serat, 0,98 gram gula, 210 miligram sodium, 298 miligram kalium'
  },
  {
    name: 'Ci Cong Fan',
    history: `Saat era Dinasti Tang, dua biksu dari Longzhou bernama Huineng dan Huiji membuat makanan bernama You Wei Zi (sejenis kue goreng). Karena adonannya terlalu tipis untuk dipotong biasa, mereka mengambil lembaran adonan dari wajan, menumpuknya, lalu memotongnya. Inilah asal-usul resep gulungan mi beras. Pada masa Kaisar Qianlong, hidangan ini dicicipi dan diberi nama "Chang Fen".

Ci Cong Fan berasal dari Kanton, Cina Selatan dan Hongkong. Dalam dialek Kanton disebut jyu cheung fan — "jyu" (babi), "cheung" (usus), "fan" (mie), karena bentuknya digulung mirip usus babi. Pada akhir abad 19-20, migrasi besar Tionghoa (Kanton & Hokkien) ke Asia Tenggara termasuk Medan membawa teknik mengukus lembaran tepung beras ini. Isian berkembang jadi ebi, udang, atau polos, dan sausnya dipadukan kecap asin gurih, minyak wijen, minyak bawang, saus asam manis, dan kaldu gurih — beda dari versi Hong Kong yang lebih ke kecap asin encer/saus manis.`,
    ingredients: `Isian sayuran segar dan sehat, atau daging (sapi/babi untuk non-muslim). Disajikan dipotong-potong, disiram kecap asin, saus asam manis pedas, atau kaldu daging berbumbu rempah, ditaburi bawang goreng dan wijen. Biasa disantap bersama gorengan uyen, siomay, lumpia sayur, dan chai thau kwe.`,
    nutrition: 'Per 100 gram: 110 kkal, 21g karbohidrat, 2,2g lemak, 1,3g protein'
  },
  {
    name: 'Bika Ambon',
    history: `Ada beberapa versi asal nama Bika Ambon: (1) pertama populer di Jalan Ambon, Sei Kera, Medan; (2) dari daerah Amplas dan buruh transmigran Jawa yang kuenya disukai orang Belanda lalu dipasarkan pedagang Tionghoa (folklore, tanpa bukti kuat); (3) dari istilah "ambon" dalam bahasa Medan yang berarti lembut; (4) legenda seorang Tionghoa di Tanah Deli membuat kue untuk asisten rumah tangganya asal Ambon. Bika Ambon sendiri adalah adaptasi kue Melayu (Bika/Bingka) dengan tambahan nira, santan, daun jeruk, serai, dan ragi.

Bika Ambon lahir dari kreativitas masyarakat Medan, perpaduan resep Bingka Melayu dan teknik fermentasi Tionghoa — tanpa perjalanan fisik dari daerah lain. Puncak popularitasnya era 1970-1980an, bermula di Jalan Ambon, lalu Jalan Mojopahit menjadi sentra resmi oleh-oleh Bika Ambon Medan karena lokasinya yang strategis.`,
    ingredients: `Santan: 200ml santan kental + 200ml air, 1 sdt kunyit bubuk, 2 serai geprek, 5-7 daun jeruk, 3 daun pandan, ½ sdt garam, 20g butter/margarin.
Biang: 2 sdt ragi instan, 10g terigu, 13g gula pasir, 100ml air hangat.
Adonan: 8 kuning telur + 2 telur utuh, 180g gula pasir (blender halus), 180g tepung tapioka, 20g tepung ketan.`,
    nutrition: '185 kkal, 3,11g lemak, 37,34g karbohidrat, 2,18g protein (Rincian: 15% lemak, 80% karbohidrat, 5% protein)'
  },
  {
    name: 'Kari Bihun',
    history: `Kari bihun Medan lahir dari akulturasi budaya: bihun dari tradisi kuliner Tionghoa dipadukan dengan kari yang dipengaruhi masakan India dan Melayu.

Berkembang di Medan akhir abad 19-awal 20, saat kota ini jadi pusat perdagangan dan perkebunan Sumatra Timur. Pedagang dan pekerja Tiongkok serta India datang dan menetap; masyarakat Tionghoa membawa bihun, masyarakat India memperkenalkan kari kaya rempah. Melalui interaksi dengan masyarakat Melayu setempat, keduanya berpadu menjadi kari bihun Medan yang diwariskan turun-temurun.`,
    ingredients: `Bahan Utama: ½ ekor ayam potong, 2 buah kentang potong kotak, 400ml santan kental, 1 liter santan encer.
Bumbu Rempah: 3cm kayu manis, 4 biji cengkeh, 2 buah kapulaga, 1 buah bunga lawang, 10 lembar daun kari, 2 batang serai, 1 sdm bubuk kari.
Bumbu Halus: 5 cabe merah keriting, 3 cabe merah kering, 6 siung bawang merah, 3 siung bawang putih, 3 butir kemiri sangrai, 1 ruas kunyit bakar.
Pelengkap: 200g bihun matang, bawang merah goreng.`,
    nutrition: 'Per porsi (350-450g): Karbohidrat 55-65g, Protein 20-30g, Lemak 20-28g, Natrium 0,8-1,2g, Kalium 300-450mg, Zat Besi 2-3,5mg, Kalsium 30-50mg, Zinc 1,5-2,5mg, Vitamin B Kompleks 0,2-1,5mg'
  },
  {
    name: 'Bolu Meranti',
    history: `Bolu Meranti dirintis oleh Ai Ling di Medan tahun 1970-an sebagai kue rumahan. Nama "Meranti" diambil dari nama jalan tempat kue ini pertama kali dititipkan dan dijual. Popularitasnya melonjak hingga membuka gerai resmi di Jalan Kruing pada 2005, menjadi ikon oleh-oleh wajib Kota Medan.

Bolu Meranti adalah akulturasi budaya Eropa dan Tionghoa: teknik bolu gulung (sponge cake) dan penggunaan mentega diperkenalkan Belanda di masa kolonial, lalu diadopsi dan dimodifikasi Nyonya Ai Ling agar teksturnya lebih padat dan lembut sesuai selera lokal. Isiannya memadukan keju khas Barat dengan meses cokelat dan selai nanas yang akrab di lidah Indonesia.`,
    ingredients: `9 kuning telur, 3 putih telur, 110g gula pasir, 1 sdt SP, 75g tepung terigu protein sedang, 20g maizena, 30g susu bubuk, 120g margarin leleh.`,
    nutrition: 'Per potong (100g, varian keju): 430 kkal, 32g lemak, 28g karbohidrat, 8g protein'
  }
];

const restaurantUpdates: Record<string, { openingHours: Record<string, string>; priceLevel: string; rating: number; latlng?: [number, number] }> = {
  'Rumah Makan Sinar Pagi': {
    openingHours: { Senin: '07.00–15.30', Selasa: '07.00–15.30', Rabu: '07.00–15.30', Kamis: '07.00–15.30', Jumat: '07.00–15.30', Sabtu: '07.00–15.30', Minggu: '07.00–15.30' },
    priceLevel: 'Rp 25.000-50.000',
    rating: 4.3,
    latlng: [3.5922718, 98.6710205] // koordinat benar dari Google Maps
  },
  'Soto Bening Khas Medan H Anwar Sulaiman': {
    openingHours: { Senin: '07.00–22.00', Selasa: '07.00–22.00', Rabu: '07.00–22.00', Kamis: '07.00–22.00', Jumat: '07.00–22.00', Sabtu: '07.00–22.00', Minggu: '07.00–22.00' },
    priceLevel: 'Rp 25.000-50.000',
    rating: 4.5
  },
  'NJONJA KOPITIAM & SEAFOOD': {
    openingHours: { Senin: '07.00–22.00', Selasa: '07.00–22.00', Rabu: '07.00–22.00', Kamis: '07.00–22.00', Jumat: '07.00–23.00', Sabtu: '07.00–23.00', Minggu: '07.00–23.00' },
    priceLevel: 'Rp 25.000-50.000',
    rating: 4.8
  },
  'Ci Cong Fan ACAI': {
    openingHours: { Senin: '06.30–18.00', Selasa: '06.30–18.00', Rabu: '06.30–18.00', Kamis: '06.30–18.00', Jumat: '06.30–18.00', Sabtu: '06.30–18.00', Minggu: 'Tutup' },
    priceLevel: 'Rp 1.000-25.000',
    rating: 4.8
  },
  'Ci Cheong Fan Acai Kotacane Yoserizal': {
    openingHours: { Senin: '17.00–20.00', Selasa: '17.00–20.00', Rabu: '17.00–20.00', Kamis: '17.00–20.00', Jumat: '17.00–20.00', Sabtu: '17.00–20.00', Minggu: 'Tutup' },
    priceLevel: 'Rp 25.000-50.000',
    rating: 4.5
  },
  'CI CIONG FAN - AHAN': {
    openingHours: { Senin: '15.00–21.00', Selasa: '15.00–21.00', Rabu: '15.00–21.00', Kamis: '15.00–21.00', Jumat: '15.00–21.00', Sabtu: '15.00–21.00', Minggu: '15.00–21.00' },
    priceLevel: '-',
    rating: 4.2
  },
  'Bika Ambon Zulaikha': {
    openingHours: { Senin: '08.00–21.00', Selasa: '08.00–21.00', Rabu: '08.00–21.00', Kamis: '08.00–21.00', Jumat: '08.00–21.00', Sabtu: '08.00–21.00', Minggu: '08.00–21.00' },
    priceLevel: '-',
    rating: 4.4
  },
  'Bika Ambon Ahun': {
    openingHours: { Senin: '08.30–18.30', Selasa: '08.30–18.30', Rabu: '08.30–18.30', Kamis: '08.30–18.30', Jumat: '08.30–18.30', Sabtu: '08.30–18.30', Minggu: '08.30–18.30' },
    priceLevel: 'Rp 75.000-175.000',
    rating: 4.2
  },
  'Bika Ambon ATI': {
    openingHours: { Senin: '08.15–20.00', Selasa: '08.15–20.00', Rabu: '08.15–20.00', Kamis: '08.15–20.00', Jumat: '08.15–20.00', Sabtu: '08.15–20.00', Minggu: '08.15–20.00' },
    priceLevel: 'Rp 75.000-100.000',
    rating: 4.8
  },
  'Rumah Makan Tabona': {
    openingHours: { Senin: '07.00-16.30', Selasa: '07.00-16.30', Rabu: '07.00-16.30', Kamis: '07.00-16.30', Jumat: '07.00-16.30', Sabtu: '07.00-16.30', Minggu: '07.00-16.30' },
    priceLevel: 'Rp 40.000-100.000',
    rating: 4.8
  },
  'Kari 168 - Yoserizal': {
    openingHours: { Senin: '08.00-16.00', Selasa: '08.00-16.00', Rabu: '08.00-16.00', Kamis: '08.00-16.00', Jumat: '08.00-16.00', Sabtu: '08.00-16.00', Minggu: '08.00-16.00' },
    priceLevel: 'Rp 25.000-50.000',
    rating: 4.9
  },
  'Restoran Kari Bihun Medan Mbak Ayu': {
    openingHours: { Senin: '09.00-21.00', Selasa: '09.00-21.00', Rabu: '09.00-18.00', Kamis: '09.00-21.00', Jumat: '09.00-21.00', Sabtu: '09.00-21.00', Minggu: '13.00-21.00' },
    priceLevel: 'Rp 5.000-63.000',
    rating: 4.9
  },
  'Bolu Meranti': {
    openingHours: { Senin: '07.00-20.00', Selasa: '07.00-20.00', Rabu: '07.00-20.00', Kamis: '07.00-20.00', Jumat: '07.00-20.00', Sabtu: '07.00-20.00', Minggu: '07.00-20.00' },
    priceLevel: 'Rp 75.000-100.000',
    rating: 4.9
  }
};

function run() {
  const updateDish = db.prepare('UPDATE dishes SET history = ?, ingredients = ?, nutrition = ? WHERE name = ?');
  for (const d of dishUpdates) {
    const res = updateDish.run(d.history, d.ingredients, d.nutrition, d.name);
    console.log(res.changes > 0 ? `✅ Dish updated: ${d.name}` : `⚠️  Dish tidak ditemukan: ${d.name}`);
  }

  const updateResto = db.prepare('UPDATE restaurants SET opening_hours = ?, price_level = ?, rating = ? WHERE name = ?');
  const updateRestoWithCoords = db.prepare('UPDATE restaurants SET opening_hours = ?, price_level = ?, rating = ?, latitude = ?, longitude = ? WHERE name = ?');

  for (const [name, data] of Object.entries(restaurantUpdates)) {
    const hoursJson = JSON.stringify(data.openingHours);
    let res;
    if (data.latlng) {
      res = updateRestoWithCoords.run(hoursJson, data.priceLevel, data.rating, data.latlng[0], data.latlng[1], name);
    } else {
      res = updateResto.run(hoursJson, data.priceLevel, data.rating, name);
    }
    console.log(res.changes > 0 ? `✅ Restoran updated: ${name}` : `⚠️  Restoran tidak ditemukan: ${name}`);
  }

  console.log('🎉 Update konten lengkap selesai.');
}

run();