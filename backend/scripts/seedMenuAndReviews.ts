import db from '../config/database.js';

interface RestaurantRow {
  id: number;
  name: string;
  rating: number;
  dish_id: number | null;
}

interface DishRow {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  image: string | null;
}

function seedMenuItems() {
  const restaurants = db.prepare('SELECT id, name, rating, dish_id FROM restaurants').all() as RestaurantRow[];

  const insertMenu = db.prepare(`
    INSERT INTO menu_items
    (restaurant_id, name, description, category, price, rating, total_ratings, image_url, is_popular, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const r of restaurants) {
    if (!r.dish_id) continue;

    const dish = db.prepare('SELECT id, name, description, price, category, image FROM dishes WHERE id = ?').get(r.dish_id) as DishRow | undefined;
    if (!dish) continue;

    insertMenu.run(
      r.id,
      dish.name,
      dish.description || `${dish.name} khas ${r.name}`,
      dish.category || 'Traditional',
      dish.price || 25000,
      r.rating || 4.5,
      Math.floor(Math.random() * 50) + 10, // total_ratings acak wajar untuk demo
      dish.image || '',
      1, // is_popular
      1  // is_available
    );
    count++;
    console.log(`✅ Menu item: ${dish.name} → ${r.name}`);
  }
  console.log(`🎉 ${count} menu items berhasil ditambahkan.\n`);
}

function seedReviews() {
  const restaurants = db.prepare('SELECT id, name FROM restaurants').all() as { id: number; name: string }[];

  const insertReview = db.prepare(`
    INSERT INTO reviews
    (restaurant_id, user_name, rating, comment, is_verified_purchase)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Template komentar generik, jelas ditandai sebagai data contoh/testing
  const dummyReviewers = [
    { name: 'Contoh Pengguna A (Data Testing)', rating: 5, comment: '[DATA CONTOH — untuk keperluan testing tampilan] Rasanya enak dan tempatnya nyaman.' },
    { name: 'Contoh Pengguna B (Data Testing)', rating: 4, comment: '[DATA CONTOH — untuk keperluan testing tampilan] Pelayanan cepat, porsi pas.' }
  ];

  let count = 0;
  for (const r of restaurants) {
    for (const reviewer of dummyReviewers) {
      insertReview.run(r.id, reviewer.name, reviewer.rating, reviewer.comment, 0);
      count++;
    }
    console.log(`✅ 2 review contoh ditambahkan untuk: ${r.name}`);
  }
  console.log(`🎉 ${count} review contoh berhasil ditambahkan.`);
  console.log('⚠️  INGAT: ini data DUMMY untuk testing UI, bukan ulasan asli. Hapus/ganti sebelum publikasi.');
}

seedMenuItems();
seedReviews();