/**
 * SEED QUIZ — menyuntikkan soal personality & main quiz ke database.
 * Jalankan dari root project:
 *   npx tsx backend/scripts/seed-quiz.ts
 *
 * ⚠️ Script ini MENGHAPUS data quiz_type 'personality' & 'main' yang lama
 *    lalu memasukkan ulang, agar URUTAN soal selalu rapi sesuai
 *    pembagian seksi di MainQuiz.tsx (10 soal per seksi).
 */
import Database from 'better-sqlite3'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'

dotenv.config()

function findDatabaseFile(): string {
  const root = process.cwd()
  const candidates: string[] = []

  const envPath = process.env.DATABASE_PATH || process.env.DB_PATH
  if (envPath) candidates.push(path.resolve(root, envPath))

  const dbDir = path.join(root, '.database')
  if (fs.existsSync(dbDir)) {
    for (const f of fs.readdirSync(dbDir).sort()) {
      if (/\.(db|sqlite|sqlite3)$/i.test(f)) candidates.push(path.join(dbDir, f))
    }
  }

  const found = candidates.find(c => fs.existsSync(c) && fs.statSync(c).isFile())
  if (!found) throw new Error('File database tidak ditemukan. Set DATABASE_PATH di .env atau pastikan ada .db di folder .database')
  return found
}

// ─── DATA PERSONALITY (5 soal × 5 opsi) ──────────────────────────────────────
// o: [option_letter, option_text, food_target]
const PERSONALITY_QUESTIONS: { q: string; o: [string, string, string][] }[] = [
  { q: 'Apa yang paling menggambarkan caramu memulai pagi hari?', o: [
    ['A', 'Langsung gas, gak perlu pemanasan!', 'KB'],
    ['B', 'Santai sambil ngopi, baru mulai', 'SM'],
    ['C', 'Rapi dulu baru keluar rumah', 'BM'],
    ['D', 'Punya ritual unik yang gak bisa diganggu', 'BA'],
    ['E', 'Fleksibel, tergantung mood', 'CF']]},
  { q: 'Bagaimana caramu menghadapi masalah besar?', o: [
    ['A', 'Langsung terjun, pikir belakangan', 'KB'],
    ['B', 'Tenang, cari solusi bareng teman', 'SM'],
    ['C', 'Buat rencana detail dulu', 'BM'],
    ['D', 'Analisis dari sudut pandang berbeda', 'BA'],
    ['E', 'Dibawa santai, pasti ada jalan', 'CF']]},
  { q: 'Pilih suasana nongkrong yang paling kamu suka!', o: [
    ['A', 'Warung pinggir jalan yang ramai', 'KB'],
    ['B', 'Rumah teman sambil masak bareng', 'SM'],
    ['C', 'Restoran estetik buat foto-foto', 'BM'],
    ['D', 'Kafe unik yang jarang orang tahu', 'BA'],
    ['E', 'Di mana saja yang penting bareng', 'CF']]},
  { q: 'Teman-temanmu biasanya datang ke kamu untuk?', o: [
    ['A', 'Minta dibelain kalau ada masalah', 'KB'],
    ['B', 'Curhat dan cari ketenangan', 'SM'],
    ['C', 'Minta saran tampilan atau event', 'BM'],
    ['D', 'Diskusi ide-ide kreatif yang out of the box', 'BA'],
    ['E', 'Teman jalan ke mana aja', 'CF']]},
  { q: 'Kalau liburan, kamu pilih yang mana?', o: [
    ['A', 'Petualangan ekstrem, naik gunung atau arung jeram', 'KB'],
    ['B', 'Kampung halaman, ketemu keluarga besar', 'SM'],
    ['C', 'Kota mode atau destinasi wisata populer', 'BM'],
    ['D', 'Tempat tersembunyi yang belum banyak dikunjungi', 'BA'],
    ['E', 'Spontan aja, lihat nanti mau ke mana', 'CF']]},
]

// ─── DATA MAIN (50 soal × 4 opsi — URUTAN = SEKSI) ───────────────────────────
// Seksi 1 (1-10): Soto Medan | 2 (11-20): Ci Cong Fan | 3 (21-30): Bika Ambon
// Seksi 4 (31-40): Kari Bihun | 5 (41-50): Bolu Meranti
// o: [option_letter, option_text, is_correct]
const MAIN_QUESTIONS: { q: string; o: [string, string, number][] }[] = [
  // ── Seksi 1: Soto Medan
  { q: 'Apa ciri khas kuah Soto Medan?', o: [['A','Kuah bening',0],['B','Kuah santan kuning',1],['C','Kuah merah pedas',0],['D','Kuah kecap hitam',0]]},
  { q: 'Protein paling umum dalam Soto Medan?', o: [['A','Daging sapi',0],['B','Ikan',0],['C','Ayam',1],['D','Udang',0]]},
  { q: 'Rempah yang memberi warna kuning pada Soto Medan?', o: [['A','Jahe',0],['B','Kunyit',1],['C','Lengkuas',0],['D','Kemiri',0]]},
  { q: 'Pelengkap khas Soto Medan yang paling populer?', o: [['A','Perkedel kentang',1],['B','Tempe goreng',0],['C','Tahu bakar',0],['D','Ubi goreng',0]]},
  { q: 'Soto Medan merupakan perpaduan pengaruh etnis?', o: [['A','Jawa dan Sunda',0],['B','Melayu, India, dan Tionghoa',1],['C','Batak dan Minang',0],['D','Arab dan Portugis',0]]},
  { q: 'Sayuran yang sering ada dalam Soto Medan?', o: [['A','Kangkung',0],['B','Tauge',1],['C','Bayam',0],['D','Sawi',0]]},
  { q: 'Bumbu dasar wajib dalam Soto Medan?', o: [['A','Serai',1],['B','Pala',0],['C','Cengkeh',0],['D','Kayu manis',0]]},
  { q: 'Soto Medan selain nasi biasanya disajikan dengan?', o: [['A','Lontong',1],['B','Mie kuning',0],['C','Bihun',0],['D','Ketupat',0]]},
  { q: 'Yang membuat kuah Soto Medan gurih dan kaya adalah?', o: [['A','Santan kental',1],['B','Mentega',0],['C','Krim',0],['D','Susu',0]]},
  { q: 'Soto Medan paling banyak ditemukan di kota?', o: [['A','Pematang Siantar',0],['B','Medan',1],['C','Binjai',0],['D','Tebing Tinggi',0]]},
  // ── Seksi 2: Ci Cong Fan
  { q: 'Ci Cong Fan berasal dari pengaruh budaya?', o: [['A','India',0],['B','Tionghoa',1],['C','Arab',0],['D','Belanda',0]]},
  { q: 'Bahan utama Ci Cong Fan adalah?', o: [['A','Tepung terigu',0],['B','Tepung beras',1],['C','Tepung tapioka',0],['D','Tepung jagung',0]]},
  { q: 'Ci Cong Fan Medan biasanya disiram saus?', o: [['A','Saus tomat',0],['B','Saus kacang dan kecap',1],['C','Saus teriyaki',0],['D','Saus tiram',0]]},
  { q: 'Tekstur khas Ci Cong Fan adalah?', o: [['A','Keras dan renyah',0],['B','Lembut dan kenyal',1],['C','Kering dan garing',0],['D','Berserat dan padat',0]]},
  { q: 'Ci Cong Fan biasanya disajikan sebagai?', o: [['A','Makanan berat',0],['B','Sarapan atau camilan',1],['C','Makanan penutup',0],['D','Minuman tradisional',0]]},
  { q: 'Ci Cong Fan paling mudah ditemukan di kawasan?', o: [['A','Kawasan Melayu',0],['B','Kawasan Pecinan',1],['C','Kawasan Batak',0],['D','Kawasan India',0]]},
  { q: 'Taburan gurih khas di atas Ci Cong Fan adalah?', o: [['A','Keju parut',0],['B','Bawang goreng',1],['C','Gula pasir',0],['D','Bubuk cabai',0]]},
  { q: 'Proses memasak Ci Cong Fan menggunakan teknik?', o: [['A','Digoreng',0],['B','Dikukus',1],['C','Dipanggang',0],['D','Direbus',0]]},
  { q: 'Perbedaan Ci Cong Fan Medan vs versi asli China?', o: [['A','Pakai bumbu rendang',0],['B','Tambahan saus kacang khas Melayu',1],['C','Menggunakan santan',0],['D','Disajikan dengan nasi uduk',0]]},
  { q: 'Cita rasa Ci Cong Fan versi Medan umumnya lebih?', o: [['A','Manis dan pedas',1],['B','Asin dan pahit',0],['C','Asam dan segar',0],['D','Tawar',0]]},
  // ── Seksi 3: Bika Ambon
  { q: 'Bika Ambon adalah kue khas kota?', o: [['A','Ambon',0],['B','Medan',1],['C','Padang',0],['D','Jakarta',0]]},
  { q: 'Ciri fisik khas Bika Ambon adalah?', o: [['A','Permukaannya bergelombang',0],['B','Bagian dalam bersarang/berongga',1],['C','Tekstur keras seperti kue kering',0],['D','Warna merah menyala',0]]},
  { q: 'Bahan yang memberi tekstur kenyal Bika Ambon?', o: [['A','Tepung terigu',0],['B','Tepung tapioka/sagu',1],['C','Tepung maizena',0],['D','Tepung ketan',0]]},
  { q: 'Warna kuning Bika Ambon berasal dari?', o: [['A','Pewarna makanan',0],['B','Kunyit dan telur',1],['C','Jagung',0],['D','Labu kuning',0]]},
  { q: 'Pusat penjualan Bika Ambon di Medan berada di jalan?', o: [['A','Jalan Asia',0],['B','Jalan Majapahit',1],['C','Jalan Pemuda',0],['D','Jalan Sudirman',0]]},
  { q: 'Pengembang alami yang membuat Bika Ambon berongga?', o: [['A','Baking powder',0],['B','Ragi/yeast',1],['C','Soda kue',0],['D','Air soda',0]]},
  { q: 'Bika Ambon paling banyak dijual sebagai?', o: [['A','Makanan sehari-hari',0],['B','Oleh-oleh khas Medan',1],['C','Makanan upacara adat',0],['D','Menu restoran mewah',0]]},
  { q: 'Cairan khas dalam adonan Bika Ambon adalah?', o: [['A','Susu sapi',0],['B','Santan kelapa',1],['C','Air kelapa',0],['D','Jus pandan',0]]},
  { q: 'Lama fermentasi adonan Bika Ambon sebelum dipanggang?', o: [['A','5–10 menit',0],['B','2–3 jam',1],['C','1–2 hari',0],['D','1 minggu',0]]},
  { q: 'Bika Ambon biasanya dipanggang menggunakan?', o: [['A','Microwave',0],['B','Cetakan khusus di atas api bawah',1],['C','Oven listrik modern',0],['D','Wajan anti lengket',0]]},
  // ── Seksi 4: Kari Bihun
  { q: 'Kari Bihun Medan merupakan perpaduan kuliner?', o: [['A','Jawa dan Bali',0],['B','India dan Tionghoa',1],['C','Arab dan Melayu',0],['D','Batak dan Minang',0]]},
  { q: 'Bihun dalam bahasa Hokkien berarti?', o: [['A','Mie kuning',0],['B','Benang beras',1],['C','Tepung putih',0],['D','Nasi goreng',0]]},
  { q: 'Rempah India dominan dalam kuah Kari Bihun Medan?', o: [['A','Vanilla',0],['B','Bubuk kari',1],['C','Oregano',0],['D','Rosemary',0]]},
  { q: 'Protein paling sering digunakan dalam Kari Bihun?', o: [['A','Daging kambing',0],['B','Ayam atau seafood',1],['C','Daging babi',0],['D','Daging rusa',0]]},
  { q: 'Kari Bihun Medan biasanya disajikan sebagai?', o: [['A','Pencuci mulut',0],['B','Sarapan pagi',1],['C','Makan malam formal',0],['D','Minuman hangat',0]]},
  { q: 'Daun yang menambah aroma khas pada Kari Bihun?', o: [['A','Daun salam',0],['B','Daun kari',1],['C','Daun pandan',0],['D','Daun jeruk',0]]},
  { q: 'Bahan yang membuat kuah Kari Bihun creamy?', o: [['A','Margarin',0],['B','Santan kelapa',1],['C','Keju',0],['D','Susu kental manis',0]]},
  { q: 'Etnis yang membawa tradisi kari ke Medan?', o: [['A','Tamil/India',1],['B','Arab',0],['C','Melayu asli',0],['D','Belanda',0]]},
  { q: 'Pelengkap khas Kari Bihun Medan?', o: [['A','Kerupuk udang',0],['B','Telur rebus atau tahu goreng',1],['C','Tempe bacem',0],['D','Ikan asin',0]]},
  { q: 'Warung Kari Bihun Medan paling ramai pada?', o: [['A','Malam hari',0],['B','Pagi hingga siang hari',1],['C','Dini hari',0],['D','Sore hari saja',0]]},
  // ── Seksi 5: Bolu Meranti
  { q: 'Bolu Meranti adalah jenis kue?', o: [['A','Kue lapis',0],['B','Bolu gulung (roll cake)',1],['C','Kue tart',0],['D','Kue kering',0]]},
  { q: 'Bolu Meranti terkenal dari toko di jalan mana?', o: [['A','Jalan Gatot Subroto',0],['B','Jalan Kruing',1],['C','Jalan Imam Bonjol',0],['D','Jalan Diponegoro',0]]},
  { q: 'Isi krim paling klasik Bolu Meranti?', o: [['A','Keju',1],['B','Cokelat hitam',0],['C','Strawberry',0],['D','Matcha',0]]},
  { q: 'Bolu Meranti paling dikenal sebagai?', o: [['A','Makanan murah meriah',0],['B','Oleh-oleh premium khas Medan',1],['C','Sajian pesta adat Batak',0],['D','Kue ritual keagamaan',0]]},
  { q: 'Tekstur khas Bolu Meranti yang disukai?', o: [['A','Kering dan renyah',0],['B','Lembut, moist, dan creamy',1],['C','Keras dan padat',0],['D','Berserat dan kurang manis',0]]},
  { q: 'Bolu Meranti harus disimpan di kulkas karena?', o: [['A','Supaya lebih enak dingin',0],['B','Kandungan krim segar mudah basi',1],['C','Agar tidak mengembang',0],['D','Aromanya menyengat',0]]},
  { q: 'Varian rasa Bolu Meranti yang tersedia biasanya?', o: [['A','Hanya 1 rasa',0],['B','Lebih dari 5 varian',1],['C','Tepat 3 rasa',0],['D','2 rasa saja',0]]},
  { q: 'Bolu Meranti dikenal luas secara nasional sekitar tahun?', o: [['A','1970-an',0],['B','2000-an',1],['C','1990-an',0],['D','1980-an',0]]},
  { q: 'Varian isi Bolu Meranti populer selain Keju?', o: [['A','Durian',1],['B','Nangka',0],['C','Mangga',0],['D','Sirsak',0]]},
  { q: 'Bolu Meranti sering dijadikan oleh-oleh karena?', o: [['A','Harganya sangat murah',0],['B','Rasanya unik dan hanya ada di Medan',1],['C','Tahan sebulan tanpa kulkas',0],['D','Bisa dikirim tanpa pendingin',0]]},
]

// ─── MAIN ────────────────────────────────────────────────────────────────────
function main() {
  const dbFile = findDatabaseFile()
  console.log('📦 Database:', dbFile)
  console.log('⚠️  Data quiz personality & main yang lama akan DIGANTI dengan data seed ini.\n')

  // timeout 10 detik: sabar menunggu kalau DB sebentar dikunci proses lain
  const db = new Database(dbFile, { timeout: 10000 })

  // WAL opsional — jangan sampai script mati cuma karena ini
  try {
    db.pragma('journal_mode = WAL')
  } catch {
    console.warn('⚠️  Gagal set mode WAL (DB dipakai proses lain). Lanjut tanpa WAL...')
  }

  const delOptions = db.prepare(`DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_type = ?)`)
  const delQuestions = db.prepare(`DELETE FROM quiz_questions WHERE quiz_type = ?`)
  const insertQ = db.prepare(`INSERT INTO quiz_questions (quiz_type, question_text) VALUES (?, ?)`)
  const insertO = db.prepare(`INSERT INTO quiz_options (question_id, option_letter, option_text, food_target, is_correct) VALUES (?, ?, ?, ?, ?)`)

  let pQ = 0, pO = 0, mQ = 0, mO = 0

  const seed = db.transaction(() => {
    // Bersihkan data lama biar urutan rapi
    delOptions.run('personality'); delQuestions.run('personality')
    delOptions.run('main'); delQuestions.run('main')
    try { db.prepare(`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'quiz_questions'`).run() } catch { /* opsional */ }

    // Personality: food_target diisi, is_correct = 0
    for (const item of PERSONALITY_QUESTIONS) {
      const r = insertQ.run('personality', item.q)
      const qid = Number(r.lastInsertRowid)
      for (const [letter, text, target] of item.o) {
        insertO.run(qid, letter, text, target, 0)
        pO++
      }
      pQ++
    }

    // Main: food_target NULL, is_correct sesuai kunci jawaban
    for (const item of MAIN_QUESTIONS) {
      const r = insertQ.run('main', item.q)
      const qid = Number(r.lastInsertRowid)
      for (const [letter, text, correct] of item.o) {
        insertO.run(qid, letter, text, null, correct)
        mO++
      }
      mQ++
    }
  })

  seed()
  db.close()

  console.log(`✅ Personality : ${pQ} soal + ${pO} opsi tersuntik`)
  console.log(`✅ Main Quiz   : ${mQ} soal + ${mO} opsi tersuntik`)
  console.log('\n🎉 Selesai! Cek di halaman admin atau jalankan aplikasi untuk mencoba quiz.')
}

main()