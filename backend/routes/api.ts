import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import googleMaps from '../services/googleMaps.js';
const router = Router();

// Tipe untuk row dari tabel restaurants
interface RestaurantRow {
  id: number;
  google_place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  rating: number;
  total_reviews: number;
  price_level: string;
  opening_hours: string;
  photos: string;
}

interface MenuItemRow {
  id: number;
  restaurant_id: number;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  is_popular: number;
}

interface ReviewRow {
  id: number;
  restaurant_id: number;
  user_name: string;
  rating: number;
  comment: string;
}

// GET: Ambil semua restoran
router.get('/restaurants', (_req: Request, res: Response) => {
  const restaurants = db.prepare('SELECT * FROM restaurants ORDER BY rating DESC').all() as RestaurantRow[];
  const parsed = restaurants.map((r) => ({
    ...r,
    opening_hours: r.opening_hours ? JSON.parse(r.opening_hours) : {},
    photos: r.photos ? JSON.parse(r.photos) : []
  }));
  res.json({ success: true, data: parsed });
});

// GET: Ambil detail 1 restoran + menu + review
router.get('/restaurants/:id', (req: Request, res: Response) => {
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id) as RestaurantRow | undefined;
  if (!restaurant) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });

  const menuItems = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ?').all(req.params.id) as MenuItemRow[];
  const reviews = db.prepare('SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC').all(req.params.id) as ReviewRow[];

  res.json({
    success: true,
    data: {
      restaurant: {
        ...restaurant,
        opening_hours: restaurant.opening_hours ? JSON.parse(restaurant.opening_hours) : {},
        photos: restaurant.photos ? JSON.parse(restaurant.photos) : []
      },
      menuItems,
      reviews
    }
  });
});

// POST: Sync data dari Google Maps ke Database
router.post('/sync-google', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    console.log(`🔍 Mencari di Google Maps dengan query: "${query}"`);

    const results = await googleMaps.searchPlaces(query);
    console.log(`📦 Hasil pencarian Google:`, results); 

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ditemukan di Google Maps (Cek API Key/Billing)' });
    }

    const place = results[0];
    console.log(`📍 Mengambil detail untuk place_id: ${place.place_id}`);

    const details = await googleMaps.getPlaceDetails(place.place_id);
    console.log(`📋 Detail Place:`, details); 

    if (!details) return res.status(404).json({ success: false, message: 'Gagal mengambil detail' });

    const insert = db.prepare(`
      INSERT OR IGNORE INTO restaurants
      (google_place_id, name, address, latitude, longitude, phone, website, rating, total_reviews, price_level, opening_hours, photos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const photosArray = details.photos ? details.photos.map((p) => googleMaps.getPhotoUrl(p.photo_reference)) : [];

    const result = insert.run(
      details.place_id,
      details.name,
      details.formatted_address || '',
      details.geometry?.location.lat,
      details.geometry?.location.lng,
      details.formatted_phone_number || null,
      details.website || null,
      details.rating || 0,
      details.user_ratings_total || 0,
      details.price_level ? 'Rp'.repeat(details.price_level) : 'Rp', 
      JSON.stringify(details.opening_hours?.weekday_text || []),
      JSON.stringify(photosArray)
    );

    console.log(`✅ Berhasil insert ke DB. Rows changed: ${result.changes}`); 

    res.json({ success: true, message: 'Berhasil sync dari Google Maps!', data: details.name });
  } catch (error: unknown) {
    console.error('❌ ERROR SYNC:', error); 
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
    res.status(500).json({ success: false, message });
  }
});
// DELETE: Hapus 1 restoran beserta menu dan reviewnya
router.delete('/restaurants/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Hapus data dependen dulu (reviews & menu_items)
    db.prepare('DELETE FROM reviews WHERE restaurant_id = ?').run(id);
    db.prepare('DELETE FROM menu_items WHERE restaurant_id = ?').run(id);
    
    // 2. Hapus restoran
    const result = db.prepare('DELETE FROM restaurants WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan' });
    }

    res.json({ success: true, message: 'Restoran dan data terkait berhasil dihapus' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus data';
    res.status(500).json({ success: false, message });
  }
});
// POST: Tambah menu manual
router.post('/menu', (req: Request, res: Response) => {
  const { restaurant_id, name, category, price, image_url, is_popular } = req.body;
  const insert = db.prepare('INSERT INTO menu_items (restaurant_id, name, category, price, image_url, is_popular) VALUES (?, ?, ?, ?, ?, ?)');
  const result = insert.run(restaurant_id, name, category, price, image_url, is_popular ? 1 : 0);
  res.json({ success: true, id: result.lastInsertRowid });
});

// POST: Tambah ulasan
router.post('/reviews', (req: Request, res: Response) => {
  const { restaurant_id, user_name, rating, comment } = req.body;
  const insert = db.prepare('INSERT INTO reviews (restaurant_id, user_name, rating, comment) VALUES (?, ?, ?, ?)');
  insert.run(restaurant_id, user_name, rating, comment);

  const updateRating = db.prepare(`
    UPDATE restaurants SET rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = ?),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?) WHERE id = ?
  `);
  updateRating.run(restaurant_id, restaurant_id, restaurant_id);

  res.json({ success: true, message: 'Ulasan berhasil ditambahkan' });
});
interface DishRow {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image: string | null;
  category: string | null;
  is_popular: number;
  history: string | null;
  journey: string | null;
  ingredients: string | null;
  spices: string | null;
  nutrition: string | null;
  cooking_steps: string | null;
}

function formatOpeningHours(hours: Record<string, string>): string {
  const values = Object.values(hours);
  const allSame = values.every((v) => v === values[0]);
  if (allSame) return `Setiap hari ${values[0]}`;
  return Object.entries(hours).map(([day, h]) => `${day}: ${h}`).join(' | ');
}


// Helper: parse JSON safely, return fallback if invalid
function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Helper: parse cooking_steps (JSON array or plain text)
function parseCookingSteps(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return value.split(/\n|\d+\./).filter((s) => s.trim().length > 0);
  }
}

// GET: Daftar semua dishes
router.get('/dishes', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM dishes ORDER BY id ASC').all() as DishRow[];
  
  const parsed = rows.map((d) => {
    return {
      id: d.id,
      name: d.name,
      description: d.description || '',
      price: d.price || 0,
      image: d.image || '',
      category: d.category || 'Traditional',
      isPopular: !!d.is_popular,
      rating: 4.5,
      ingredients: safeJsonParse<string[]>(d.ingredients, []),
      location: '',
      history: d.history,
      journey: d.journey,
      spices: safeJsonParse<string[]>(d.spices, []),
      nutrition: safeJsonParse<Record<string, unknown> | null>(d.nutrition, null) ?? undefined,
      cooking_steps: parseCookingSteps(d.cooking_steps)
    };
  });
  
  res.json({ success: true, data: parsed });
});

// GET: Detail 1 dish
router.get('/dishes/:id', (req: Request, res: Response) => {
  const d = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id) as DishRow | undefined;
  if (!d) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });

  const restos = db.prepare('SELECT * FROM restaurants WHERE dish_id = ? ORDER BY rating DESC').all(req.params.id) as RestaurantRow[];

  // Parsing cooking_steps untuk detail dish juga
  const steps = parseCookingSteps(d.cooking_steps);

  const recommendedPlaces = restos.map((r) => {
    const hours = safeJsonParse<Record<string, string>>(r.opening_hours, {});
    return {
      name: r.name,
      address: r.address,
      rating: r.rating,
      hours: Object.keys(hours).length > 0 ? formatOpeningHours(hours) : '-',
      priceRange: r.price_level,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}`
    };
  });

  res.json({
    success: true,
    data: {
      id: d.id,
      name: d.name,
      description: d.description || '',
      price: d.price || 0,
      image: d.image || '',
      category: d.category || 'Traditional',
      isPopular: !!d.is_popular,
      rating: recommendedPlaces.length > 0 ? recommendedPlaces.reduce((sum, p) => sum + p.rating, 0) / recommendedPlaces.length : 4.5,
      ingredients: safeJsonParse<string[]>(d.ingredients, []),
      location: recommendedPlaces[0]?.address || '',
      history: d.history,
      journey: d.journey,
      spices: safeJsonParse<string[]>(d.spices, []),
      nutrition: safeJsonParse<Record<string, unknown> | null>(d.nutrition, null) ?? undefined,
      cooking_steps: steps,
      recommendedPlaces
    }
  });
});
export default router;
