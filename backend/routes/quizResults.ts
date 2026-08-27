import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// ==========================================
// POST /quiz-results
// Menyimpan hasil quiz (personality & main) dari frontend
// ==========================================
router.post('/', (req: Request, res: Response) => {
    try {
        const {
            user_id,
            quiz_type,
            food_result = null,
            total_score = 0,
            score_kb = 0,
            score_sm = 0,
            score_bm = 0,
            score_ba = 0,
            score_cf = 0
        } = req.body;

        if (!user_id || !quiz_type) {
            return res.status(400).json({ success: false, message: 'user_id dan quiz_type wajib diisi' });
        }

        const stmt = db.prepare(`
            INSERT INTO quiz_results
            (user_id, quiz_type, score, result, food_result, total_score,
             score_kb, score_sm, score_bm, score_ba, score_cf)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            user_id,
            quiz_type,
            total_score || 0,   // isi juga kolom lama "score"
            food_result,        // isi juga kolom lama "result"
            food_result,
            total_score || 0,
            score_kb || 0,
            score_sm || 0,
            score_bm || 0,
            score_ba || 0,
            score_cf || 0
        );

        const newRow = db.prepare('SELECT * FROM quiz_results WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, data: newRow });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// GET /quiz-results/user/:userId
// Dipakai ProfilePage untuk menampilkan hasil
// ==========================================
router.get('/user/:userId', (req: Request, res: Response) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM quiz_results
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
        `).all(req.params.userId);

        res.json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// GET /quiz-results — semua hasil (untuk admin)
// ==========================================
router.get('/', (req: Request, res: Response) => {
    try {
        const rows = db.prepare(`
            SELECT qr.*, u.username, u.email
            FROM quiz_results qr
            LEFT JOIN users u ON qr.user_id = u.id
            ORDER BY qr.created_at DESC
        `).all();
        res.json({ success: true, data: rows });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;