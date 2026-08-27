import db from '../config/database.js';

// Tambah kolom cooking_steps jika belum ada
try {
  db.exec(`ALTER TABLE dishes ADD COLUMN cooking_steps TEXT;`);
  console.log('✅ Kolom cooking_steps ditambahkan');
} catch {
  console.log('⏭️  Kolom cooking_steps sudah ada, skip');
}

const cookingStepsData: Record<string, string[]> = {
  'Soto Medan': [
    'Rebus daging ayam dalam 1 liter air hingga matang, angkat dan suwir-suwir. Simpan kaldu rebusan.',
    'Haluskan bumbu: bawang putih, bawang merah, kemiri sangrai, kunyit bakar, jahe, dan lengkuas menggunakan blender atau ulekan.',
    'Panaskan 3 sdm minyak goreng, tumis bumbu halus bersama serai geprek, daun jeruk, dan daun salam hingga harum dan matang (sekitar 5–7 menit).',
    'Tuang kaldu ayam ke dalam bumbu yang sudah ditumis, aduk rata dan didihkan dengan api sedang.',
    'Masukkan santan cair ke dalam kuah, aduk perlahan agar tidak pecah. Bumbui dengan garam dan merica secukupnya.',
    'Masukkan ayam suwir ke dalam kuah, masak kembali selama 10 menit hingga semua bumbu meresap sempurna.',
    'Siapkan mangkuk saji: tata bihun atau ketupat, ayam suwir, perkedel kentang, dan telur rebus.',
    'Siram dengan kuah soto panas, taburi bawang goreng, daun bawang, dan seledri cincang.',
    'Sajikan hangat bersama emping goreng dan sambal rawit merah di sisi mangkuk.'
  ],

  'Ci Cong Fan': [
    'Campurkan tepung beras (tang mien) dengan air panas sedikit demi sedikit, aduk hingga membentuk adonan lembut yang tidak lengket.',
    'Oleskan minyak tipis-tipis pada loyang datar atau nampan tahan panas agar adonan tidak menempel.',
    'Tuang adonan tipis merata (±2mm) ke atas loyang, lalu tambahkan isian pilihan: ebi yang sudah direndam, udang segar, atau biarkan polos.',
    'Kukus loyang selama 3–5 menit hingga adonan matang dan terlihat transparan.',
    'Angkat loyang dari kukusan, biarkan agak dingin sebentar. Gulung adonan dengan spatula tipis dari satu sisi ke sisi lain membentuk gulungan silinder.',
    'Potong gulungan mi beras menjadi beberapa bagian sepanjang 4–5 cm dan tata di atas piring saji.',
    'Siapkan saus: campurkan kecap asin gurih, minyak wijen, dan minyak bawang goreng, aduk rata.',
    'Siram gulungan mi dengan saus, lalu tambahkan saus asam manis pedas secukupnya.',
    'Taburi dengan bawang goreng renyah dan wijen putih. Sajikan segera bersama siomay dan lumpia sebagai pendamping.'
  ],

  'Bika Ambon': [
    'Buat biang ragi: campurkan ragi instan, terigu biang, gula biang, dan air hangat (40°C). Aduk rata dan diamkan 15–20 menit hingga berbusa aktif.',
    'Rebus serai geprek, daun jeruk, dan daun pandan dalam 200ml air selama 10 menit hingga harum. Saring dan dinginkan air rebusan.',
    'Kocok kuning telur dan 2 telur utuh bersama gula pasir halus menggunakan mixer kecepatan sedang hingga mengembang pucat dan kental (sekitar 8–10 menit).',
    'Campurkan tepung tapioka dan tepung ketan, ayak lalu masukkan perlahan ke dalam kocokan telur sambil diaduk dengan spatula menggunakan gerakan melipat (fold).',
    'Tuang santan kental, air rebusan rempah yang sudah dingin, garam, dan butter/margarin leleh. Aduk rata hingga adonan halus.',
    'Masukkan biang ragi yang sudah aktif ke dalam adonan, aduk perlahan. Tutup mangkuk dengan kain bersih dan diamkan fermentasi selama 1–2 jam di tempat hangat hingga muncul gelembung.',
    'Panaskan cetakan bika ambon (loyang berlubang-lubang atau loyang biasa) di dalam oven 190°C selama 10 menit. Olesi dengan margarin tipis-tipis.',
    'Tuang adonan yang sudah berfermentasi ke dalam cetakan panas setinggi ¾ penuh. Panggang dengan api bawah 190°C selama 15 menit.',
    'Aktifkan api atas (grill), panggang lagi 5–10 menit hingga permukaan berwarna keemasan cantik. Tusuk dengan lidi — jika tidak ada adonan menempel, Bika Ambon sudah matang.',
    'Keluarkan dari oven, biarkan dingin di dalam cetakan selama 10 menit sebelum dikeluarkan. Potong dan sajikan.'
  ],

  'Kari Bihun': [
    'Haluskan bumbu: bawang merah, bawang putih, kemiri sangrai, kunyit bakar, cabai merah, dan sedikit jahe hingga benar-benar halus.',
    'Panaskan 4 sdm minyak goreng dalam wajan besar, masukkan kayu manis, cengkeh, kapulaga, dan bunga lawang. Tumis 1–2 menit hingga harum.',
    'Masukkan bumbu halus ke dalam wajan, tambahkan serai geprek dan daun kari. Tumis dengan api sedang selama 8–10 menit hingga bumbu matang, berminyak, dan warnanya lebih gelap.',
    'Masukkan potongan ayam, aduk rata agar bumbu menyelimuti semua bagian. Masak 5 menit hingga ayam berubah warna.',
    'Masukkan kentang potong kotak, tuang santan encer 1 liter. Tambahkan bubuk kari, garam, dan gula secukupnya. Didihkan dengan api besar.',
    'Setelah mendidih, kecilkan api ke sedang. Masak 20–25 menit hingga ayam matang sempurna dan kentang empuk.',
    'Tuang santan kental, aduk perlahan agar tidak pecah. Masak 5 menit lagi dengan api kecil sambil terus diaduk.',
    'Koreksi rasa — tambahkan garam, merica, atau kecap ikan jika diperlukan. Kari harus terasa gurih, sedikit pedas, dan wangi.',
    'Rendam bihun kering dalam air panas selama 5–8 menit hingga lunak, tiriskan dan tata di mangkuk atau piring.',
    'Siram bihun dengan kuah kari panas beserta potongan ayam dan kentang. Taburi bawang goreng dan sajikan segera.'
  ],

  'Bolu Meranti': [
    'Siapkan loyang ukuran 28x28cm atau 30x30cm, alasi dengan kertas roti dan olesi tipis dengan margarin. Panaskan oven di suhu 200°C selama 15 menit.',
    'Kocok 9 kuning telur, 3 putih telur, gula pasir, dan SP (ovalet) menggunakan mixer kecepatan tinggi selama 10–15 menit hingga adonan mengembang tiga kali lipat, pucat, dan sangat kental (ribbon stage).',
    'Ayak campuran tepung terigu, maizena, dan susu bubuk. Masukkan bertahap ke dalam kocokan telur menggunakan spatula dengan gerakan melipat dari bawah ke atas (jangan diaduk memutar agar tidak kempes).',
    'Tuang margarin leleh yang sudah agak dingin perlahan di pinggir mangkuk sambil terus dilipat perlahan hingga tercampur rata dan adonan tetap mengembang.',
    'Tuang adonan ke loyang, ratakan dengan spatula. Panggang dalam oven 200°C selama 12–15 menit hingga permukaan kuning keemasan dan jika ditekan ringan langsung membal kembali.',
    'Keluarkan bolu dari oven, balikkan di atas kertas roti baru yang sudah ditaburi gula halus tipis. Lepaskan kertas roti lama dengan hati-hati selagi masih panas.',
    'Oleskan isian pilihan secara merata: selai keju cream, meses cokelat, atau selai nanas — sisakan 2cm di bagian ujung agar tidak tumpah saat digulung.',
    'Gulung bolu dari sisi terdekat dengan bantuan kertas roti secara perlahan dan rapat. Bungkus gulungan dengan kertas roti dan pilin ujung-ujungnya seperti permen.',
    'Dinginkan di kulkas minimal 30 menit agar gulungan set dan mudah dipotong. Potong dengan pisau tajam yang sudah dipanaskan atau dibasahi air untuk hasil potongan rapi.',
    'Sajikan di suhu ruangan. Bolu Meranti paling nikmat dikonsumsi dalam 2 hari setelah dibuat.'
  ]
};

const update = db.prepare(`UPDATE dishes SET cooking_steps = ? WHERE name = ?`);

for (const [name, steps] of Object.entries(cookingStepsData)) {
  const res = update.run(JSON.stringify(steps), name);
  if (res.changes > 0) {
    console.log(`✅ cooking_steps diisi: ${name} (${steps.length} langkah)`);
  } else {
    console.log(`⚠️  Tidak ditemukan di DB: ${name}`);
  }
}

console.log('\n🎉 Selesai! Semua langkah memasak berhasil diisi.');
