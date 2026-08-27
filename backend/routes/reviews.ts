import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/reviews?restaurant_id=X
router.get('/', (req: Request, res: Response) => {
    console.log(' [GET] /api/reviews - Query:', req.query);

    try {
        const { restaurant_id } = req.query;

        if (!restaurant_id) {
            return res.status(400).json({
                success: false,
                message: 'restaurant_id wajib diisi'
            });
        }

        const reviews = db.prepare(`
            SELECT 
                id,
                restaurant_id,
                user_name,
                rating,
                comment,
                created_at
            FROM reviews
            WHERE restaurant_id = ?
            ORDER BY created_at DESC
        `).all(Number(restaurant_id));

        console.log(`✅ [GET] Berhasil mengambil ${reviews.length} ulasan`);
        res.json(reviews);
    } catch (error) {
        console.error('❌ [GET] Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Gagal mengambil ulasan'
        });
    }
});

// POST /api/reviews
router.post('/', (req: Request, res: Response) => {
    console.log(' [POST] /api/reviews - Body:', JSON.stringify(req.body, null, 2));

    try {
        let {
            restaurant_id,
            user_id,
            user_name,
            user_avatar,
            user_email,
            rating,
            comment,
            images,
            visited_date,
            is_verified_purchase
        } = req.body;

        // Validasi field wajib
        if (!restaurant_id || !rating || !comment) {
            console.error('❌ Validasi gagal - field kosong');
            return res.status(400).json({
                success: false,
                message: 'Field wajib: restaurant_id, rating, comment'
            });
        }

        // Jika user_name tidak ada, buat nama otomatis
        if (!user_name || user_name.trim() === '') {
            user_name = `Guest_${Date.now().toString().slice(-6)}`;
            console.log('⚠️ user_name kosong, menggunakan:', user_name);
        }

        // Jika user_id tidak ada, gunakan 0 (anonymous)
        if (!user_id) {
            user_id = 0;
            console.log('⚠️ user_id kosong, menggunakan:', user_id);
        }

        // Validasi rating
        const ratingNum = Number(rating);
        if (ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus antara 1-5'
            });
        }

        // Siapkan semua nilai dengan default yang tepat
        const values = [
            Number(restaurant_id),
            Number(user_id),
            String(user_name).trim(),
            user_avatar || null,
            user_email || null,
            ratingNum,
            String(comment).trim(),
            images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
            visited_date || new Date().toISOString().split('T')[0],
            is_verified_purchase ? 1 : 0
        ];

        console.log('💾 Menyiapkan INSERT dengan values:', values);

        // INSERT dengan semua kolom untuk menghindari error NOT NULL
        const stmt = db.prepare(`
            INSERT INTO reviews (
                restaurant_id,
                user_id,
                user_name,
                user_avatar,
                user_email,
                rating,
                comment,
                images,
                visited_date,
                is_verified_purchase
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(...values);

        // Ambil review yang baru dibuat
        const newReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);

        console.log('✅ [POST] Review berhasil dibuat:', newReview);
        res.status(201).json(newReview);
    } catch (error: any) {
        console.error('❌ [POST] ERROR detail:', error);
        console.error('❌ [POST] Error message:', error.message);
        console.error('❌ [POST] Error stack:', error.stack);

        res.status(500).json({
            success: false,
            message: error.message || 'Gagal mengirim ulasan',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;