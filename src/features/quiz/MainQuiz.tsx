import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoginModal from '../../components/LoginModal'
import { Star, Trophy, Loader2, ChevronLeft, CheckCircle2, XCircle, Target, BookOpen, ArrowLeft } from 'lucide-react'

import API_BASE_URL from '../../config/api'

const SECTIONS = [
  { id: 1, name: 'Soto Medan', emoji: '🍜', color: 'from-amber-500 to-orange-600', desc: '10 Soal tentang sejarah & resep Soto Medan' },
  { id: 2, name: 'Ci Cong Fan', emoji: '🥟', color: 'from-red-500 to-rose-600', desc: '10 Soal tentang akulturasi Tionghoa-Medan' },
  { id: 3, name: 'Bika Ambon', emoji: '🍰', color: 'from-yellow-500 to-amber-600', desc: '10 Soal tentang kue bersarang khas Medan' },
  { id: 4, name: 'Kari Bihun', emoji: '🍛', color: 'from-orange-500 to-red-600', desc: '10 Soal tentang perpaduan India & Tionghoa' },
  { id: 5, name: 'Bolu Meranti', emoji: '🧁', color: 'from-pink-500 to-rose-600', desc: '10 Soal tentang bolu gulung legendaris' }
]

// Fallback data lokal jika API tidak tersedia (10 soal per seksi × 5 seksi)
const LOCAL_MAIN_QUESTIONS = [
  // Seksi 1: Soto Medan (index 0–9)
  { id:1, question_text:'Apa ciri khas kuah Soto Medan?', options:[{id:1,option_text:'Kuah bening',option_letter:'A',is_correct:0},{id:2,option_text:'Kuah santan kuning',option_letter:'B',is_correct:1},{id:3,option_text:'Kuah merah pedas',option_letter:'C',is_correct:0},{id:4,option_text:'Kuah kecap hitam',option_letter:'D',is_correct:0}]},
  { id:2, question_text:'Protein paling umum dalam Soto Medan?', options:[{id:5,option_text:'Daging sapi',option_letter:'A',is_correct:0},{id:6,option_text:'Ikan',option_letter:'B',is_correct:0},{id:7,option_text:'Ayam',option_letter:'C',is_correct:1},{id:8,option_text:'Udang',option_letter:'D',is_correct:0}]},
  { id:3, question_text:'Rempah yang memberi warna kuning pada Soto Medan?', options:[{id:9,option_text:'Jahe',option_letter:'A',is_correct:0},{id:10,option_text:'Kunyit',option_letter:'B',is_correct:1},{id:11,option_text:'Lengkuas',option_letter:'C',is_correct:0},{id:12,option_text:'Kemiri',option_letter:'D',is_correct:0}]},
  { id:4, question_text:'Pelengkap khas Soto Medan yang paling populer?', options:[{id:13,option_text:'Perkedel kentang',option_letter:'A',is_correct:1},{id:14,option_text:'Tempe goreng',option_letter:'B',is_correct:0},{id:15,option_text:'Tahu bakar',option_letter:'C',is_correct:0},{id:16,option_text:'Ubi goreng',option_letter:'D',is_correct:0}]},
  { id:5, question_text:'Soto Medan merupakan perpaduan pengaruh etnis?', options:[{id:17,option_text:'Jawa dan Sunda',option_letter:'A',is_correct:0},{id:18,option_text:'Melayu, India, dan Tionghoa',option_letter:'B',is_correct:1},{id:19,option_text:'Batak dan Minang',option_letter:'C',is_correct:0},{id:20,option_text:'Arab dan Portugis',option_letter:'D',is_correct:0}]},
  { id:6, question_text:'Sayuran yang sering ada dalam Soto Medan?', options:[{id:21,option_text:'Kangkung',option_letter:'A',is_correct:0},{id:22,option_text:'Tauge',option_letter:'B',is_correct:1},{id:23,option_text:'Bayam',option_letter:'C',is_correct:0},{id:24,option_text:'Sawi',option_letter:'D',is_correct:0}]},
  { id:7, question_text:'Bumbu dasar wajib dalam Soto Medan?', options:[{id:25,option_text:'Serai',option_letter:'A',is_correct:1},{id:26,option_text:'Pala',option_letter:'B',is_correct:0},{id:27,option_text:'Cengkeh',option_letter:'C',is_correct:0},{id:28,option_text:'Kayu manis',option_letter:'D',is_correct:0}]},
  { id:8, question_text:'Soto Medan selain nasi biasanya disajikan dengan?', options:[{id:29,option_text:'Lontong',option_letter:'A',is_correct:1},{id:30,option_text:'Mie kuning',option_letter:'B',is_correct:0},{id:31,option_text:'Bihun',option_letter:'C',is_correct:0},{id:32,option_text:'Ketupat',option_letter:'D',is_correct:0}]},
  { id:9, question_text:'Yang membuat kuah Soto Medan gurih dan kaya adalah?', options:[{id:33,option_text:'Santan kental',option_letter:'A',is_correct:1},{id:34,option_text:'Mentega',option_letter:'B',is_correct:0},{id:35,option_text:'Krim',option_letter:'C',is_correct:0},{id:36,option_text:'Susu',option_letter:'D',is_correct:0}]},
  { id:10, question_text:'Soto Medan paling banyak ditemukan di kota?', options:[{id:37,option_text:'Pematang Siantar',option_letter:'A',is_correct:0},{id:38,option_text:'Medan',option_letter:'B',is_correct:1},{id:39,option_text:'Binjai',option_letter:'C',is_correct:0},{id:40,option_text:'Tebing Tinggi',option_letter:'D',is_correct:0}]},
  // Seksi 2: Ci Cong Fan (index 10–19)
  { id:11, question_text:'Ci Cong Fan berasal dari pengaruh budaya?', options:[{id:41,option_text:'India',option_letter:'A',is_correct:0},{id:42,option_text:'Tionghoa',option_letter:'B',is_correct:1},{id:43,option_text:'Arab',option_letter:'C',is_correct:0},{id:44,option_text:'Belanda',option_letter:'D',is_correct:0}]},
  { id:12, question_text:'Bahan utama Ci Cong Fan adalah?', options:[{id:45,option_text:'Tepung terigu',option_letter:'A',is_correct:0},{id:46,option_text:'Tepung beras',option_letter:'B',is_correct:1},{id:47,option_text:'Tepung tapioka',option_letter:'C',is_correct:0},{id:48,option_text:'Tepung jagung',option_letter:'D',is_correct:0}]},
  { id:13, question_text:'Ci Cong Fan Medan biasanya disiram saus?', options:[{id:49,option_text:'Saus tomat',option_letter:'A',is_correct:0},{id:50,option_text:'Saus kacang dan kecap',option_letter:'B',is_correct:1},{id:51,option_text:'Saus teriyaki',option_letter:'C',is_correct:0},{id:52,option_text:'Saus tiram',option_letter:'D',is_correct:0}]},
  { id:14, question_text:'Tekstur khas Ci Cong Fan adalah?', options:[{id:53,option_text:'Keras dan renyah',option_letter:'A',is_correct:0},{id:54,option_text:'Lembut dan kenyal',option_letter:'B',is_correct:1},{id:55,option_text:'Kering dan garing',option_letter:'C',is_correct:0},{id:56,option_text:'Berserat dan padat',option_letter:'D',is_correct:0}]},
  { id:15, question_text:'Ci Cong Fan biasanya disajikan sebagai?', options:[{id:57,option_text:'Makanan berat',option_letter:'A',is_correct:0},{id:58,option_text:'Sarapan atau camilan',option_letter:'B',is_correct:1},{id:59,option_text:'Makanan penutup',option_letter:'C',is_correct:0},{id:60,option_text:'Minuman tradisional',option_letter:'D',is_correct:0}]},
  { id:16, question_text:'Ci Cong Fan paling mudah ditemukan di kawasan?', options:[{id:61,option_text:'Kawasan Melayu',option_letter:'A',is_correct:0},{id:62,option_text:'Kawasan Pecinan',option_letter:'B',is_correct:1},{id:63,option_text:'Kawasan Batak',option_letter:'C',is_correct:0},{id:64,option_text:'Kawasan India',option_letter:'D',is_correct:0}]},
  { id:17, question_text:'Taburan gurih khas di atas Ci Cong Fan adalah?', options:[{id:65,option_text:'Keju parut',option_letter:'A',is_correct:0},{id:66,option_text:'Bawang goreng',option_letter:'B',is_correct:1},{id:67,option_text:'Gula pasir',option_letter:'C',is_correct:0},{id:68,option_text:'Bubuk cabai',option_letter:'D',is_correct:0}]},
  { id:18, question_text:'Proses memasak Ci Cong Fan menggunakan teknik?', options:[{id:69,option_text:'Digoreng',option_letter:'A',is_correct:0},{id:70,option_text:'Dikukus',option_letter:'B',is_correct:1},{id:71,option_text:'Dipanggang',option_letter:'C',is_correct:0},{id:72,option_text:'Direbus',option_letter:'D',is_correct:0}]},
  { id:19, question_text:'Perbedaan Ci Cong Fan Medan vs versi asli China?', options:[{id:73,option_text:'Pakai bumbu rendang',option_letter:'A',is_correct:0},{id:74,option_text:'Tambahan saus kacang khas Melayu',option_letter:'B',is_correct:1},{id:75,option_text:'Menggunakan santan',option_letter:'C',is_correct:0},{id:76,option_text:'Disajikan dengan nasi uduk',option_letter:'D',is_correct:0}]},
  { id:20, question_text:'Cita rasa Ci Cong Fan versi Medan umumnya lebih?', options:[{id:77,option_text:'Manis dan pedas',option_letter:'A',is_correct:1},{id:78,option_text:'Asin dan pahit',option_letter:'B',is_correct:0},{id:79,option_text:'Asam dan segar',option_letter:'C',is_correct:0},{id:80,option_text:'Tawar',option_letter:'D',is_correct:0}]},
  // Seksi 3: Bika Ambon (index 20–29)
  { id:21, question_text:'Bika Ambon adalah kue khas kota?', options:[{id:81,option_text:'Ambon',option_letter:'A',is_correct:0},{id:82,option_text:'Medan',option_letter:'B',is_correct:1},{id:83,option_text:'Padang',option_letter:'C',is_correct:0},{id:84,option_text:'Jakarta',option_letter:'D',is_correct:0}]},
  { id:22, question_text:'Ciri fisik khas Bika Ambon adalah?', options:[{id:85,option_text:'Permukaannya bergelombang',option_letter:'A',is_correct:0},{id:86,option_text:'Bagian dalam bersarang/berongga',option_letter:'B',is_correct:1},{id:87,option_text:'Tekstur keras seperti kue kering',option_letter:'C',is_correct:0},{id:88,option_text:'Warna merah menyala',option_letter:'D',is_correct:0}]},
  { id:23, question_text:'Bahan yang memberi tekstur kenyal Bika Ambon?', options:[{id:89,option_text:'Tepung terigu',option_letter:'A',is_correct:0},{id:90,option_text:'Tepung tapioka/sagu',option_letter:'B',is_correct:1},{id:91,option_text:'Tepung maizena',option_letter:'C',is_correct:0},{id:92,option_text:'Tepung ketan',option_letter:'D',is_correct:0}]},
  { id:24, question_text:'Warna kuning Bika Ambon berasal dari?', options:[{id:93,option_text:'Pewarna makanan',option_letter:'A',is_correct:0},{id:94,option_text:'Kunyit dan telur',option_letter:'B',is_correct:1},{id:95,option_text:'Jagung',option_letter:'C',is_correct:0},{id:96,option_text:'Labu kuning',option_letter:'D',is_correct:0}]},
  { id:25, question_text:'Pusat penjualan Bika Ambon di Medan berada di jalan?', options:[{id:97,option_text:'Jalan Asia',option_letter:'A',is_correct:0},{id:98,option_text:'Jalan Majapahit',option_letter:'B',is_correct:1},{id:99,option_text:'Jalan Pemuda',option_letter:'C',is_correct:0},{id:100,option_text:'Jalan Sudirman',option_letter:'D',is_correct:0}]},
  { id:26, question_text:'Pengembang alami yang membuat Bika Ambon berongga?', options:[{id:101,option_text:'Baking powder',option_letter:'A',is_correct:0},{id:102,option_text:'Ragi/yeast',option_letter:'B',is_correct:1},{id:103,option_text:'Soda kue',option_letter:'C',is_correct:0},{id:104,option_text:'Air soda',option_letter:'D',is_correct:0}]},
  { id:27, question_text:'Bika Ambon paling banyak dijual sebagai?', options:[{id:105,option_text:'Makanan sehari-hari',option_letter:'A',is_correct:0},{id:106,option_text:'Oleh-oleh khas Medan',option_letter:'B',is_correct:1},{id:107,option_text:'Makanan upacara adat',option_letter:'C',is_correct:0},{id:108,option_text:'Menu restoran mewah',option_letter:'D',is_correct:0}]},
  { id:28, question_text:'Cairan khas dalam adonan Bika Ambon adalah?', options:[{id:109,option_text:'Susu sapi',option_letter:'A',is_correct:0},{id:110,option_text:'Santan kelapa',option_letter:'B',is_correct:1},{id:111,option_text:'Air kelapa',option_letter:'C',is_correct:0},{id:112,option_text:'Jus pandan',option_letter:'D',is_correct:0}]},
  { id:29, question_text:'Lama fermentasi adonan Bika Ambon sebelum dipanggang?', options:[{id:113,option_text:'5–10 menit',option_letter:'A',is_correct:0},{id:114,option_text:'2–3 jam',option_letter:'B',is_correct:1},{id:115,option_text:'1–2 hari',option_letter:'C',is_correct:0},{id:116,option_text:'1 minggu',option_letter:'D',is_correct:0}]},
  { id:30, question_text:'Bika Ambon biasanya dipanggang menggunakan?', options:[{id:117,option_text:'Microwave',option_letter:'A',is_correct:0},{id:118,option_text:'Cetakan khusus di atas api bawah',option_letter:'B',is_correct:1},{id:119,option_text:'Oven listrik modern',option_letter:'C',is_correct:0},{id:120,option_text:'Wajan anti lengket',option_letter:'D',is_correct:0}]},
  // Seksi 4: Kari Bihun (index 30–39)
  { id:31, question_text:'Kari Bihun Medan merupakan perpaduan kuliner?', options:[{id:121,option_text:'Jawa dan Bali',option_letter:'A',is_correct:0},{id:122,option_text:'India dan Tionghoa',option_letter:'B',is_correct:1},{id:123,option_text:'Arab dan Melayu',option_letter:'C',is_correct:0},{id:124,option_text:'Batak dan Minang',option_letter:'D',is_correct:0}]},
  { id:32, question_text:'Bihun dalam bahasa Hokkien berarti?', options:[{id:125,option_text:'Mie kuning',option_letter:'A',is_correct:0},{id:126,option_text:'Benang beras',option_letter:'B',is_correct:1},{id:127,option_text:'Tepung putih',option_letter:'C',is_correct:0},{id:128,option_text:'Nasi goreng',option_letter:'D',is_correct:0}]},
  { id:33, question_text:'Rempah India dominan dalam kuah Kari Bihun Medan?', options:[{id:129,option_text:'Vanilla',option_letter:'A',is_correct:0},{id:130,option_text:'Bubuk kari',option_letter:'B',is_correct:1},{id:131,option_text:'Oregano',option_letter:'C',is_correct:0},{id:132,option_text:'Rosemary',option_letter:'D',is_correct:0}]},
  { id:34, question_text:'Protein paling sering digunakan dalam Kari Bihun?', options:[{id:133,option_text:'Daging kambing',option_letter:'A',is_correct:0},{id:134,option_text:'Ayam atau seafood',option_letter:'B',is_correct:1},{id:135,option_text:'Daging babi',option_letter:'C',is_correct:0},{id:136,option_text:'Daging rusa',option_letter:'D',is_correct:0}]},
  { id:35, question_text:'Kari Bihun Medan biasanya disajikan sebagai?', options:[{id:137,option_text:'Pencuci mulut',option_letter:'A',is_correct:0},{id:138,option_text:'Sarapan pagi',option_letter:'B',is_correct:1},{id:139,option_text:'Makan malam formal',option_letter:'C',is_correct:0},{id:140,option_text:'Minuman hangat',option_letter:'D',is_correct:0}]},
  { id:36, question_text:'Daun yang menambah aroma khas pada Kari Bihun?', options:[{id:141,option_text:'Daun salam',option_letter:'A',is_correct:0},{id:142,option_text:'Daun kari',option_letter:'B',is_correct:1},{id:143,option_text:'Daun pandan',option_letter:'C',is_correct:0},{id:144,option_text:'Daun jeruk',option_letter:'D',is_correct:0}]},
  { id:37, question_text:'Bahan yang membuat kuah Kari Bihun creamy?', options:[{id:145,option_text:'Margarin',option_letter:'A',is_correct:0},{id:146,option_text:'Santan kelapa',option_letter:'B',is_correct:1},{id:147,option_text:'Keju',option_letter:'C',is_correct:0},{id:148,option_text:'Susu kental manis',option_letter:'D',is_correct:0}]},
  { id:38, question_text:'Etnis yang membawa tradisi kari ke Medan?', options:[{id:149,option_text:'Tamil/India',option_letter:'A',is_correct:1},{id:150,option_text:'Arab',option_letter:'B',is_correct:0},{id:151,option_text:'Melayu asli',option_letter:'C',is_correct:0},{id:152,option_text:'Belanda',option_letter:'D',is_correct:0}]},
  { id:39, question_text:'Pelengkap khas Kari Bihun Medan?', options:[{id:153,option_text:'Kerupuk udang',option_letter:'A',is_correct:0},{id:154,option_text:'Telur rebus atau tahu goreng',option_letter:'B',is_correct:1},{id:155,option_text:'Tempe bacem',option_letter:'C',is_correct:0},{id:156,option_text:'Ikan asin',option_letter:'D',is_correct:0}]},
  { id:40, question_text:'Warung Kari Bihun Medan paling ramai pada?', options:[{id:157,option_text:'Malam hari',option_letter:'A',is_correct:0},{id:158,option_text:'Pagi hingga siang hari',option_letter:'B',is_correct:1},{id:159,option_text:'Dini hari',option_letter:'C',is_correct:0},{id:160,option_text:'Sore hari saja',option_letter:'D',is_correct:0}]},
  // Seksi 5: Bolu Meranti (index 40–49)
  { id:41, question_text:'Bolu Meranti adalah jenis kue?', options:[{id:161,option_text:'Kue lapis',option_letter:'A',is_correct:0},{id:162,option_text:'Bolu gulung (roll cake)',option_letter:'B',is_correct:1},{id:163,option_text:'Kue tart',option_letter:'C',is_correct:0},{id:164,option_text:'Kue kering',option_letter:'D',is_correct:0}]},
  { id:42, question_text:'Bolu Meranti terkenal dari toko di jalan mana?', options:[{id:165,option_text:'Jalan Gatot Subroto',option_letter:'A',is_correct:0},{id:166,option_text:'Jalan Kruing',option_letter:'B',is_correct:1},{id:167,option_text:'Jalan Imam Bonjol',option_letter:'C',is_correct:0},{id:168,option_text:'Jalan Diponegoro',option_letter:'D',is_correct:0}]},
  { id:43, question_text:'Isi krim paling klasik Bolu Meranti?', options:[{id:169,option_text:'Keju',option_letter:'A',is_correct:1},{id:170,option_text:'Cokelat hitam',option_letter:'B',is_correct:0},{id:171,option_text:'Strawberry',option_letter:'C',is_correct:0},{id:172,option_text:'Matcha',option_letter:'D',is_correct:0}]},
  { id:44, question_text:'Bolu Meranti paling dikenal sebagai?', options:[{id:173,option_text:'Makanan murah meriah',option_letter:'A',is_correct:0},{id:174,option_text:'Oleh-oleh premium khas Medan',option_letter:'B',is_correct:1},{id:175,option_text:'Sajian pesta adat Batak',option_letter:'C',is_correct:0},{id:176,option_text:'Kue ritual keagamaan',option_letter:'D',is_correct:0}]},
  { id:45, question_text:'Tekstur khas Bolu Meranti yang disukai?', options:[{id:177,option_text:'Kering dan renyah',option_letter:'A',is_correct:0},{id:178,option_text:'Lembut, moist, dan creamy',option_letter:'B',is_correct:1},{id:179,option_text:'Keras dan padat',option_letter:'C',is_correct:0},{id:180,option_text:'Berserat dan kurang manis',option_letter:'D',is_correct:0}]},
  { id:46, question_text:'Bolu Meranti harus disimpan di kulkas karena?', options:[{id:181,option_text:'Supaya lebih enak dingin',option_letter:'A',is_correct:0},{id:182,option_text:'Kandungan krim segar mudah basi',option_letter:'B',is_correct:1},{id:183,option_text:'Agar tidak mengembang',option_letter:'C',is_correct:0},{id:184,option_text:'Aromanya menyengat',option_letter:'D',is_correct:0}]},
  { id:47, question_text:'Varian rasa Bolu Meranti yang tersedia biasanya?', options:[{id:185,option_text:'Hanya 1 rasa',option_letter:'A',is_correct:0},{id:186,option_text:'Lebih dari 5 varian',option_letter:'B',is_correct:1},{id:187,option_text:'Tepat 3 rasa',option_letter:'C',is_correct:0},{id:188,option_text:'2 rasa saja',option_letter:'D',is_correct:0}]},
  { id:48, question_text:'Bolu Meranti dikenal luas secara nasional sekitar tahun?', options:[{id:189,option_text:'1970-an',option_letter:'A',is_correct:0},{id:190,option_text:'2000-an',option_letter:'B',is_correct:1},{id:191,option_text:'1990-an',option_letter:'C',is_correct:0},{id:192,option_text:'1980-an',option_letter:'D',is_correct:0}]},
  { id:49, question_text:'Varian isi Bolu Meranti populer selain Keju?', options:[{id:193,option_text:'Durian',option_letter:'A',is_correct:1},{id:194,option_text:'Nangka',option_letter:'B',is_correct:0},{id:195,option_text:'Mangga',option_letter:'C',is_correct:0},{id:196,option_text:'Sirsak',option_letter:'D',is_correct:0}]},
  { id:50, question_text:'Bolu Meranti sering dijadikan oleh-oleh karena?', options:[{id:197,option_text:'Harganya sangat murah',option_letter:'A',is_correct:0},{id:198,option_text:'Rasanya unik dan hanya ada di Medan',option_letter:'B',is_correct:1},{id:199,option_text:'Tahan sebulan tanpa kulkas',option_letter:'C',is_correct:0},{id:200,option_text:'Bisa dikirim tanpa pendingin',option_letter:'D',is_correct:0}]}
]

const QUESTIONS_PER_SECTION = 10
const POINTS_PER_QUESTION = 10

interface Option {
  id: number
  option_text: string
  option_letter: string
  is_correct: number
}

interface Question {
  id: number
  question_text: string
  options: Option[]
}

export default function MainQuiz() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) setShowLoginModal(false)
  }, [isAuthenticated])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/quiz?type=main`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAllQuestions(data.data)
          return
        }
        // Fallback ke data lokal jika API tidak tersedia
        setAllQuestions(LOCAL_MAIN_QUESTIONS)
      } catch (error) {
        console.error('Error fetching main quiz, using local data:', error)
        setAllQuestions(LOCAL_MAIN_QUESTIONS)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const activeQuestions = selectedSectionIndex !== null 
    ? allQuestions.slice(selectedSectionIndex * QUESTIONS_PER_SECTION, (selectedSectionIndex + 1) * QUESTIONS_PER_SECTION)
    : []

  const currentSection = selectedSectionIndex !== null ? SECTIONS[selectedSectionIndex] : null

  const handleStartQuiz = (sectionIndex: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    setSelectedSectionIndex(sectionIndex)
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  const handleBackToMenu = () => {
    setSelectedSectionIndex(null)
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
  }

  const handleAnswer = (optionId: number, isCorrect: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(optionId)
    
    const newScore = isCorrect === 1 ? score + POINTS_PER_QUESTION : score
    setScore(newScore)

    setTimeout(() => {
      if (currentQuestion < activeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
        saveToDatabase(newScore, selectedSectionIndex!)
      }
    }, 800)
  }

  const saveToDatabase = async (totalScore: number, sectionIdx: number) => {
    if (!user) return
    try {
      setIsSubmitting(true)
      const scorePayload: Record<string, number> = { score_kb: 0, score_sm: 0, score_bm: 0, score_ba: 0, score_cf: 0 }
      const keys = ['score_kb', 'score_sm', 'score_bm', 'score_ba', 'score_cf']
      scorePayload[keys[sectionIdx]] = totalScore

      await fetch(`${API_BASE_URL}/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          quiz_type: 'main',
          food_result: currentSection?.name || null,
          total_score: totalScore,
          ...scorePayload
        })
      })
      console.log('✅ Main quiz result saved')
    } catch (error) {
      console.error('Error saving main quiz result:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== 1. TAMPILAN LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
          <p className="text-amber-800 font-medium">Memuat menu kuis...</p>
        </div>
      </div>
    )
  }

  // ========== 2. TAMPILAN MENU PEMILIHAN ==========
  if (selectedSectionIndex === null) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
          <div className="max-w-5xl mx-auto pt-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium">
              <ChevronLeft className="w-5 h-5" /> Kembali
            </button>

            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">Pilih Kuliner untuk Dikuis</h1>
              <p className="text-gray-600">Uji pengetahuanmu tentang salah satu makanan khas Medan di bawah ini</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SECTIONS.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => handleStartQuiz(idx)}
                  className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden border border-gray-100"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${section.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {section.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{section.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{section.desc}</p>
                    <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>Mulai Kuis</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
      </>
    )
  }

  // ========== 3. TAMPILAN HASIL ==========
  if (showResult && currentSection) {
    const maxScore = activeQuestions.length * POINTS_PER_QUESTION
    const percentage = Math.round((score / maxScore) * 100)
    const isPass = percentage >= 70

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
          <div className="max-w-2xl mx-auto pt-8">
            <button onClick={handleBackToMenu} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium">
              <ChevronLeft className="w-5 h-5" /> Pilih Kuliner Lain
            </button>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className={`bg-gradient-to-r ${isPass ? 'from-amber-500 to-orange-600' : 'from-slate-500 to-slate-700'} p-8 text-white text-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '20px 20px' }}></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-4">{currentSection.emoji}</div>
                  <h2 className="text-3xl font-bold mb-2">{currentSection.name}</h2>
                  <p className="text-white/90">{isPass ? 'Luar Biasa! Pengetahuanmu sangat mantap!' : 'Ayo belajar lagi tentang kuliner ini!'}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-500 mb-2">Skor Kamu</p>
                  <div className="text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{score}</div>
                  <p className="text-gray-500 mt-1">dari {maxScore} poin ({percentage}%)</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBackToMenu} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    Pilih Kuliner Lain
                  </button>
                  <button onClick={() => navigate('/')} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                    Beranda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
      </>
    )
  }

  // ========== 4. TAMPILAN KUIS (Per Section) ==========
  if (activeQuestions.length === 0 || !currentSection) return null

  const question = activeQuestions[currentQuestion]
  const totalProgress = ((currentQuestion + 1) / activeQuestions.length) * 100

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <button onClick={handleBackToMenu} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium">
            <ChevronLeft className="w-5 h-5" /> Kembali ke Menu
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentSection.color} text-white text-sm font-bold mb-4 shadow-md`}>
                <span className="text-lg">{currentSection.emoji}</span>
                <span>Kuis {currentSection.name}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 font-medium">Soal {currentQuestion + 1} dari {activeQuestions.length}</span>
                <span className="text-sm text-amber-600 font-bold flex items-center gap-1">
                  <Star className="w-4 h-4" /> Skor: {score}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className={`bg-gradient-to-r ${currentSection.color} h-3 rounded-full transition-all duration-500 ease-out`} style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-tight">{question.question_text}</h2>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedAnswer === option.id
                const isCorrect = option.is_correct === 1
                let borderColor = 'border-gray-200 hover:border-amber-400 hover:bg-amber-50/50'
                let bgIcon = 'bg-gray-100 text-gray-600'
                let showIcon = false

                if (isSelected) {
                  showIcon = true
                  if (isCorrect) { borderColor = 'border-green-500 bg-green-50'; bgIcon = 'bg-green-500 text-white' }
                  else { borderColor = 'border-red-500 bg-red-50'; bgIcon = 'bg-red-500 text-white' }
                } else if (selectedAnswer !== null && isCorrect) {
                  borderColor = 'border-green-500 bg-green-50'; bgIcon = 'bg-green-500 text-white'; showIcon = true
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id, option.is_correct)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-300 font-medium relative overflow-hidden group ${borderColor} ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${bgIcon}`}>
                        {showIcon ? (isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />) : option.option_letter}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{option.option_text}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Target className="w-3 h-3" /> Pilih jawaban yang paling tepat
              </p>
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
    </>
  )
}