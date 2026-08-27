export interface RecommendedPlace {
  name: string;
  address: string;
  rating: number;
  hours: string;
  priceRange: string;
  mapsUrl: string;
}

export interface NutritionInfo {
  calories: string;
  fat: string;
  carbs: string;
  protein: string;
  other?: string;
}

export interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  isPopular: boolean;
  ingredients: string[];
  location: string;
  // Extended fields
  history?: string;
  journey?: string;
  spices?: string[];
  nutrition?: NutritionInfo;
  recommendedPlaces?: RecommendedPlace[];
}

export const foods: Food[] = [
  {
    id: 1,
    name: "Soto Medan",
    description: "Soto dengan kuah santan kental, perpaduan Melayu dan Tionghoa yang kaya rempah",
    price: 37500,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
    category: "Soup",
    isPopular: true,
    location: "Jl. Sei Deli No.2D/1, Medan Barat",
    ingredients: [
      "500g daging ayam (paha/dada)", "200ml santan cair", "2 batang serai",
      "3 lembar daun jeruk", "2 lembar daun salam", "1 liter air",
      "4 siung bawang putih", "6 butir bawang merah", "3 butir kemiri",
      "2cm kunyit", "1cm jahe", "1cm lengkuas",
      "Perkedel kentang", "Telur rebus", "Emping goreng", "Sambal rawit"
    ],
    history: `Istilah "soto" berasal dari makanan Tionghoa yang dalam dialek Hokkian disebut cau do atau chau tu, yang artinya jeroan dengan rempah-rempah. Di Indonesia, soto pertama kali dikenal di pesisir pantai utara Jawa pada abad ke-19, yakni masakan berkuah dengan potongan daging ataupun jeroan. Awalnya penjual soto menjual dagangannya dengan cara memikul di lokasi-lokasi ramai seperti persimpangan jalan atau pasar. Seiring waktu, soto tidak lagi dijajakan dengan pikulan, melainkan disajikan di kedai atau warung.`,
    journey: `Soto pertama kali populer di Semarang pada abad 19 karena banyaknya pedagang Tionghoa di pelabuhan. Makanan cepat saji seperti Caudo menjadi pilihan praktis dan mengenyangkan. Dari Semarang, soto menyebar ke berbagai daerah di Indonesia termasuk Medan, dan mengalami modifikasi sesuai bahan dan budaya lokal. Bumbu lokal seperti kunyit, serai, kemiri, dan santan ditambahkan. Karena penduduk Jawa umumnya Muslim, daging babi diganti dengan ayam, sapi, atau kerbau.`,
    spices: [
      "Bawang putih (4 siung)", "Bawang merah (6 butir)", "Kemiri sangrai (3 butir)",
      "Kunyit bakar (2cm)", "Jahe (1cm)", "Lengkuas (1cm)",
      "Ketumbar bubuk (1 sdt)", "Merica bubuk (½ sdt)", "Serai geprek (2 batang)",
      "Daun jeruk (3 lembar)", "Daun salam (2 lembar)", "Santan cair (200ml)"
    ],
    nutrition: {
      calories: "312 kkal",
      fat: "14,29 gram",
      carbs: "19,55 gram",
      protein: "24,01 gram",
      other: "Serat: 1,7g | Gula: 0,98g | Sodium: 210mg | Kalium: 298mg"
    },
    recommendedPlaces: [
      {
        name: "Rumah Makan Sinar Pagi",
        address: "Jl. Sei Deli No.2D/1, Silalas, Kec. Medan Barat, Kota Medan, 20236",
        rating: 4.3,
        hours: "Setiap hari 07.00–15.30",
        priceRange: "Rp 25.000–50.000",
        mapsUrl: "https://maps.google.com/?q=Rumah+Makan+Sinar+Pagi+Medan"
      },
      {
        name: "Soto Bening Khas Medan H Anwar Sulaiman",
        address: "Jl. Brigjen Katamso No.43, A U R, Kec. Medan Maimun, Kota Medan, 20159",
        rating: 4.5,
        hours: "Setiap hari 07.00–22.00",
        priceRange: "Rp 25.000–50.000",
        mapsUrl: "https://maps.google.com/?q=Soto+Bening+Khas+Medan+H+Anwar+Sulaiman"
      },
      {
        name: "Njonja Kopitiam & Seafood",
        address: "Jl. S. Parman No.22-24, Petisah Tengah, Kec. Medan Petisah, Kota Medan, 20112",
        rating: 4.8,
        hours: "Sen–Kam & Sel: 07.00–22.00 | Jum–Min: 07.00–23.00",
        priceRange: "Rp 25.000–50.000",
        mapsUrl: "https://maps.google.com/?q=Njonja+Kopitiam+Seafood+Medan+Jl+S+Parman"
      }
    ]
  },
  {
    id: 2,
    name: "Ci Cong Fan",
    description: "Gulungan mi beras khas Kanton yang disiram saus gurih, hasil akulturasi Tionghoa-Medan",
    price: 20000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80",
    category: "Traditional",
    isPopular: true,
    location: "Jl. Gandhi, Sei Rengas I, Kec. Medan Kota",
    ingredients: [
      "Lembaran tepung beras (tang mien)", "Ebi / udang segar", "Sayuran segar",
      "Kecap asin gurih", "Minyak wijen", "Minyak bawang",
      "Saus asam manis", "Bawang goreng", "Wijen",
      "Siomay (pendamping)", "Lumpia isi sayur (pendamping)", "Gorengan uyen/talas (pendamping)"
    ],
    history: `Pada era Dinasti Tang, dua biksu dari Longzhou bernama Huineng dan Huiji membuat makanan bernama You Wei Zi. Karena adonannya terlalu tipis, mereka mengambil lembaran dari wajan dengan sendok, menumpuknya, lalu memotongnya — inilah asal-usul gulungan mi beras. Pada masa Kaisar Qianlong, makanan ini diberi nama "Chang Fen" setelah sang kaisar terkesan dengan teksturnya yang sejuk, lembut, dan halus saat berkunjung ke Luoding.`,
    journey: `Ci Cong Fan berasal dari daerah Kanton, Provinsi Guangdong, Cina Selatan dan Hong Kong. Dalam dialek Kanton, "jyu" berarti babi, "cheung" berarti usus, dan "fan" berarti mie — dinamai demikian karena bentuk gulungannya mirip usus babi. Pada akhir abad ke-19 hingga awal abad ke-20, migrasi besar etnis Tionghoa ke Medan membawa tradisi kuliner ini. Di Medan terjadi lokalisasi rasa: isian berubah dari babi panggang merah menjadi ebi, udang segar, atau polos. Sausnya pun beradaptasi dengan perpaduan kecap asin, minyak wijen, minyak bawang, saus asam manis, dan kaldu gurih.`,
    spices: [
      "Kecap asin gurih", "Minyak wijen", "Minyak bawang",
      "Saus asam manis pedas", "Kaldu daging", "Bawang goreng", "Wijen putih"
    ],
    nutrition: {
      calories: "110 kkal",
      fat: "2,20 gram",
      carbs: "21,00 gram",
      protein: "1,30 gram",
      other: "Per 100 gram gulungan mi beras (tanpa topping)"
    },
    recommendedPlaces: [
      {
        name: "Ci Cong Fan ACAI",
        address: "Jl. Gandhi, Sei Rengas I, Kec. Medan Kota, Kota Medan, Sumatera Utara 20211",
        rating: 4.8,
        hours: "Sen–Sab 06.30–18.00 | Minggu Tutup",
        priceRange: "Rp 1.000–25.000",
        mapsUrl: "https://maps.google.com/?q=Ci+Cong+Fan+ACAI+Jl+Gandhi+Medan"
      },
      {
        name: "Ci Cheong Fan Acai Kotacane Yoserizal",
        address: "Jl. Kotacane, Sei Renggas I, Kec. Medan Kota, Kota Medan, Sumatera Utara 20211",
        rating: 4.5,
        hours: "Sen–Sab 17.00–20.00 | Minggu Tutup",
        priceRange: "Rp 25.000–50.000",
        mapsUrl: "https://maps.google.com/?q=Ci+Cheong+Fan+Acai+Kotacane+Yoserizal+Medan"
      },
      {
        name: "Ci Ciong Fan - AHAN",
        address: "Jl. Aip II KS Tubun No.93, Pandau Hulu I, Medan Kota, Kota Medan, 20233",
        rating: 4.2,
        hours: "Setiap hari 15.00–21.00",
        priceRange: "—",
        mapsUrl: "https://maps.google.com/?q=Ci+Ciong+Fan+AHAN+Medan+KS+Tubun"
      }
    ]
  },
  {
    id: 3,
    name: "Bika Ambon",
    description: "Kue tradisional Medan dengan tekstur bersarang khas, hasil akulturasi Melayu dan Tionghoa",
    price: 87500,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    category: "Dessert",
    isPopular: true,
    location: "Jl. Mojopahit, Petisah Tengah, Medan Petisah",
    ingredients: [
      "Tepung tapioka (180g)", "Tepung ketan (20g)", "8 kuning telur + 2 telur utuh",
      "Gula pasir (180g, blender halus)", "Santan kental (200ml)", "Air (200ml)",
      "Kunyit bubuk (1 sdt)", "Serai geprek (2 batang)", "Daun jeruk (5-7 lembar)",
      "Daun pandan (3 lembar)", "Garam (½ sdt)", "Butter/margarin (20g)",
      "Ragi instan (2 sdt/8g)", "Terigu biang (10g)", "Gula biang (13g)", "Air hangat biang (100ml)"
    ],
    history: `Terdapat beberapa versi sejarah Bika Ambon. Versi pertama: nama "Ambon" berasal dari Jalan Ambon di Sei Kera, Medan, tempat kue ini pertama kali populer. Versi kedua (mitos/folklore): nama berasal dari "Amplas-Kebon" karena seorang buruh transmigran Jawa membuatnya di daerah Amplas, kemudian dipasarkan oleh pedagang Tionghoa. Versi ketiga: kata "ambon" dalam bahasa lokal Medan berarti lembut, sesuai tekstur kue ini. Versi keempat: seorang Tionghoa di Tanah Deli memberikan kue ini kepada asisten rumah tangganya yang berasal dari Ambon, dan karena sangat disukai, dinamai Bika Ambon. Bika Ambon sendiri merupakan adaptasi kue Melayu (Bika/Bingka) yang dimodifikasi dengan nira, santan, daun jeruk, serai, dan ragi.`,
    journey: `Bika Ambon lahir dari kreativitas masyarakat Kota Medan melalui percampuran resep Bingka Melayu dengan teknik fermentasi Tionghoa. Popularitasnya mencapai puncak pada era 1970-1980an. Bermula di Jalan Ambon, para pengusaha kemudian menjadikan Jalan Mojopahit sebagai sentra resmi oleh-oleh Bika Ambon di Medan karena lokasinya yang strategis untuk penjualan oleh-oleh.`,
    spices: [
      "Kunyit bubuk (1 sdt)", "Serai geprek (2 batang)", "Daun jeruk (5-7 lembar)",
      "Daun pandan (3 lembar)", "Ragi instan (8g)", "Santan kental", "Butter/margarin"
    ],
    nutrition: {
      calories: "185 kkal",
      fat: "3,11 gram",
      carbs: "37,34 gram",
      protein: "2,18 gram",
      other: "Rincian: 15% lemak | 80% karbohidrat | 5% protein"
    },
    recommendedPlaces: [
      {
        name: "Bika Ambon Zulaikha",
        address: "Jl. Mojopahit No.70 A-C, Petisah Tengah, Kec. Medan Petisah, Kota Medan, 20112",
        rating: 4.4,
        hours: "Setiap hari 08.00–21.00",
        priceRange: "—",
        mapsUrl: "https://maps.google.com/?q=Bika+Ambon+Zulaikha+Jl+Mojopahit+Medan"
      },
      {
        name: "Bika Ambon Ahun",
        address: "Jl. Sekip No.9, Sekip, Kec. Medan Petisah, Kota Medan, 20113",
        rating: 4.2,
        hours: "Setiap hari 08.30–18.30",
        priceRange: "Rp 75.000–175.000",
        mapsUrl: "https://maps.google.com/?q=Bika+Ambon+Ahun+Jl+Sekip+Medan"
      },
      {
        name: "Bika Ambon ATI",
        address: "Jl. Mojopahit No.11J, Petisah Tengah, Kec. Medan Petisah, Kota Medan, 20112",
        rating: 4.8,
        hours: "Setiap hari 08.15–20.00",
        priceRange: "Rp 75.000–100.000",
        mapsUrl: "https://maps.google.com/?q=Bika+Ambon+ATI+Jl+Mojopahit+Medan"
      }
    ]
  },
  {
    id: 4,
    name: "Kari Bihun",
    description: "Perpaduan bihun Tionghoa dengan kuah kari India-Melayu, kuning keemasan dan kaya rempah",
    price: 62500,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80",
    category: "Noodles",
    isPopular: true,
    location: "Jl. Mangkubumi No.17, Medan Maimun",
    ingredients: [
      "Ayam ½ ekor (potong-potong)", "Kentang 2 buah (potong kotak)",
      "Santan kental 400ml", "Santan encer 1 liter",
      "Kayu manis 3cm", "Cengkeh 4 biji", "Kapulaga 2 buah",
      "Bunga lawang 1 buah", "Daun kari 10 lembar", "Serai 2 batang",
      "Bubuk kari 1 sdm", "Cabe merah keriting 5 buah", "Cabe merah kering 3 buah",
      "Bawang merah 6 siung", "Bawang putih 3 siung", "Kemiri sangrai 3 butir",
      "Kunyit bakar 1 ruas", "Bihun matang 200g", "Bawang goreng"
    ],
    history: `Kari Bihun Medan lahir dari proses akulturasi budaya. Hidangan ini menggabungkan bihun dari tradisi kuliner Tionghoa dengan kari yang dipengaruhi masakan India dan Melayu. Perpaduan berbagai budaya tersebut menghasilkan cita rasa khas yang menjadi bagian dari identitas kuliner Medan.`,
    journey: `Kari Bihun berkembang di Medan pada akhir abad ke-19 hingga awal abad ke-20, saat Medan menjadi pusat perdagangan dan perkebunan Sumatra Timur. Pedagang Tionghoa membawa bihun, sementara masyarakat India memperkenalkan kari kaya rempah. Melalui interaksi dengan masyarakat Melayu setempat, keduanya berpadu hingga menjadi kari bihun Medan. Seiring waktu, hidangan ini diwariskan dari generasi ke generasi dan dikenal sebagai salah satu makanan khas Medan.`,
    spices: [
      "Kunyit bakar", "Ketumbar", "Jintan", "Bawang merah & bawang putih",
      "Jahe", "Serai", "Kayu manis", "Cengkeh", "Kapulaga",
      "Bunga lawang", "Daun kari", "Bubuk kari", "Santan"
    ],
    nutrition: {
      calories: "~350–450 gram per porsi",
      fat: "20–28 gram",
      carbs: "55–65 gram",
      protein: "20–30 gram",
      other: "Natrium: 0,8–1,2g | Kalium: 300–450mg | Zat Besi: 2–3,5mg | Kalsium: 30–50mg | Vit B Kompleks: 0,2–1,5mg"
    },
    recommendedPlaces: [
      {
        name: "Rumah Makan Tabona",
        address: "Jl. Mangkubumi No.17, A U R, Kec. Medan Maimun, Kota Medan, 20212",
        rating: 4.8,
        hours: "Setiap hari 07.00–16.30",
        priceRange: "Rp 40.000–100.000",
        mapsUrl: "https://maps.google.com/?q=Rumah+Makan+Tabona+Jl+Mangkubumi+Medan"
      },
      {
        name: "Kari 168 – Yoserizal",
        address: "Jl. Yose Rizal No.110, Medan",
        rating: 4.9,
        hours: "Setiap hari 08.00–16.00",
        priceRange: "Rp 25.000–50.000",
        mapsUrl: "https://maps.google.com/?q=Kari+168+Yoserizal+Jl+Yoserizal+Medan"
      },
      {
        name: "Restoran Kari Bihun Medan Mbak Ayu",
        address: "Jl. Sei Kapuas No.25AA, Medan",
        rating: 4.9,
        hours: "Sen,Sel,Kam–Sab: 09.00–21.00 | Rab: 09.00–18.00 | Min: 13.00–21.00",
        priceRange: "Rp 5.000–63.000",
        mapsUrl: "https://maps.google.com/?q=Kari+Bihun+Medan+Mbak+Ayu+Jl+Sei+Kapuas"
      }
    ]
  },
  {
    id: 5,
    name: "Bolu Meranti",
    description: "Bolu gulung lembut khas Medan dengan isian keju, meses, atau selai nanas — oleh-oleh ikonik sejak 1970-an",
    price: 87500,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80",
    category: "Dessert",
    isPopular: true,
    location: "Jl. Kruing Simpang Razak No.7C, Medan",
    ingredients: [
      "9 kuning telur", "3 putih telur", "110g gula pasir",
      "1 sdt SP (ovalet)", "75g tepung terigu protein sedang",
      "20g maizena", "30g susu bubuk", "120g margarin (lelehkan)",
      "Isian: keju / meses cokelat / selai nanas"
    ],
    history: `Bolu Meranti awalnya adalah kue rumahan yang dirintis oleh seorang ibu bernama Ai Ling di Medan pada tahun 1970-an. Nama "Meranti" diambil dari nama jalan tempat kue ini pertama kali dititipkan dan dijual, yaitu Jalan Meranti. Berkat teksturnya yang lembut dan rasa yang khas, popularitas bolu gulung ini terus melonjak hingga akhirnya membuka gerai resmi di Jalan Kruing pada tahun 2005, menjadi salah satu ikon oleh-oleh paling wajib dari Kota Medan.`,
    journey: `Bolu Meranti merupakan bentuk akulturasi kuliner antara budaya Eropa dan Tionghoa di Kota Medan. Bolu gulung (sponge cake) dan penggunaan mentega (butter) diperkenalkan oleh bangsa Belanda pada masa kolonial. Teknik baking ala Barat ini diadopsi dan dimodifikasi oleh masyarakat Tionghoa-Medan, khususnya Nyonya Ai Ling. Tekstur kue disesuaikan menjadi lebih padat dan lembut sesuai selera lokal. Perpaduan global-lokal terlihat pada isiannya: keju khas Barat dikombinasikan dengan meses cokelat dan selai nanas yang akrab di lidah Indonesia.`,
    spices: [
      "Margarin berkualitas tinggi (120g)", "Esens vanila", "SP/ovalet (1 sdt)",
      "Susu bubuk (30g)", "Maizena (20g)", "Gula pasir (110g)"
    ],
    nutrition: {
      calories: "430 kkal",
      fat: "32 gram",
      carbs: "28 gram",
      protein: "8 gram",
      other: "Per potong ±100g (varian keju)"
    },
    recommendedPlaces: [
      {
        name: "Bolu Meranti (Gerai Resmi)",
        address: "Jl. Kruing Simpang Razak No.7C, Medan",
        rating: 4.9,
        hours: "Setiap hari 07.00–20.00",
        priceRange: "Rp 75.000–100.000",
        mapsUrl: "https://maps.google.com/?q=Bolu+Meranti+Jl+Kruing+Simpang+Razak+Medan"
      }
    ]
  }
]

export const categories: string[] = [
  "Semua",
  "Traditional",
  "Main Course",
  "Noodles",
  "Soup",
  "Dessert"
]
