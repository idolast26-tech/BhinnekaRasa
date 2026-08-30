import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import db from '../config/database.js';

const router = Router();

// ==========================================
// PROTEKSI: WAJIB LOGIN & ROLE ADMIN
// ==========================================
router.use(authenticateToken);
router.use(requireAdmin);

// ==========================================
// DASHBOARD STATS
// ==========================================
router.get('/stats', (req: AuthRequest, res: Response) => {
    try {
        const totalDishes = db.prepare('SELECT COUNT(*) as count FROM dishes').get() as any;
        const totalMenuItems = db.prepare('SELECT COUNT(*) as count FROM menu_items').get() as any;
        const totalRestaurants = db.prepare('SELECT COUNT(*) as count FROM restaurants').get() as any;
        const totalReviews = db.prepare('SELECT COUNT(*) as count FROM reviews').get() as any;
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
        const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM quiz_questions').get() as any;
        const totalQuizResults = db.prepare('SELECT COUNT(*) as count FROM quiz_results').get() as any;

        res.json({
            success: true,
            data: {
                totalDishes: totalDishes?.count || 0,
                totalMenuItems: totalMenuItems?.count || 0,
                totalRestaurants: totalRestaurants?.count || 0,
                totalReviews: totalReviews?.count || 0,
                totalUsers: totalUsers?.count || 0,
                totalQuestions: totalQuestions?.count || 0,
                totalQuizResults: totalQuizResults?.count || 0
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// RESTAURANTS CRUD (Tabel: restaurants)
// Struktur: id, google_place_id, name, address, latitude, longitude, phone,
//           website, rating, total_reviews, price_level, opening_hours, photos,
//           dish_id, dish_name, dish_history, dish_ingredients, dish_nutrition
// ==========================================
router.get('/restaurants', (req: AuthRequest, res: Response) => {
    try {
        const restaurants = db.prepare('SELECT * FROM restaurants ORDER BY name ASC').all();
        res.json({ success: true, data: restaurants });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/restaurants/:id', (req: AuthRequest, res: Response) => {
    try {
        const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restoran tidak ditemukan' });
        res.json({ success: true, data: restaurant });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/restaurants', (req: AuthRequest, res: Response) => {
    try {
        const {
            google_place_id, name, address, latitude, longitude, phone, website,
            rating, total_reviews, price_level, opening_hours, photos,
            dish_id, dish_name, dish_history, dish_ingredients, dish_nutrition
        } = req.body;

        if (!name) return res.status(400).json({ success: false, message: 'Nama restoran wajib diisi' });

        const stmt = db.prepare(`
            INSERT INTO restaurants
            (google_place_id, name, address, latitude, longitude, phone, website,
             rating, total_reviews, price_level, opening_hours, photos,
             dish_id, dish_name, dish_history, dish_ingredients, dish_nutrition)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            google_place_id || `manual-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name,
            address || '',
            latitude || 0,
            longitude || 0,
            phone || '',
            website || '',
            rating || 0,
            total_reviews || 0,
            price_level || '',
            opening_hours || '',
            photos || '',
            dish_id || null,
            dish_name || '',
            dish_history || '',
            dish_ingredients || '',
            dish_nutrition || ''
        );
        const newRestaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, data: newRestaurant });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/restaurants/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const {
            google_place_id, name, address, latitude, longitude, phone, website,
            rating, total_reviews, price_level, opening_hours, photos,
            dish_id, dish_name, dish_history, dish_ingredients, dish_nutrition
        } = req.body;

        const stmt = db.prepare(`
            UPDATE restaurants SET
                google_place_id=?, name=?, address=?, latitude=?, longitude=?,
                phone=?, website=?, rating=?, total_reviews=?, price_level=?,
                opening_hours=?, photos=?, dish_id=?, dish_name=?, dish_history=?,
                dish_ingredients=?, dish_nutrition=?
            WHERE id=?
        `);
        stmt.run(
            google_place_id || null,
            name,
            address || '',
            latitude || 0,
            longitude || 0,
            phone || '',
            website || '',
            rating || 0,
            total_reviews || 0,
            price_level || '',
            opening_hours || '',
            photos || '',
            dish_id || null,
            dish_name || '',
            dish_history || '',
            dish_ingredients || '',
            dish_nutrition || '',
            id
        );
        const updated = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id);
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/restaurants/:id', (req: AuthRequest, res: Response) => {
    try {
        db.prepare('DELETE FROM restaurants WHERE id = ?').run(req.params.id);
        res.json({ success: true, message: 'Restaurant deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// ==========================================
// DISHES CRUD (Tabel: dishes)
// Struktur: id, name, history, ingredients, nutrition, created_at, description
// ==========================================
router.get('/dishes', (req: AuthRequest, res: Response) => {
    try {
        const dishes = db.prepare('SELECT * FROM dishes ORDER BY created_at DESC').all();
        res.json({ success: true, data: dishes });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/dishes', (req: AuthRequest, res: Response) => {
    try {
        // TAMBAHKAN: journey, spices, cooking_steps di sini
        const { name, description, history, ingredients, nutrition, image, category, price, is_popular, journey, spices, cooking_steps } = req.body;

        if (!name || !description) {
            return res.status(400).json({ success: false, message: 'Nama dan deskripsi wajib diisi' });
        }

        // TAMBAHKAN kolom journey, spices, cooking_steps di query
        const stmt = db.prepare(`
            INSERT INTO dishes (name, description, history, ingredients, nutrition, image, category, price, is_popular, journey, spices, cooking_steps)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            name,
            description,
            history || '',
            ingredients || '',
            nutrition || '',
            image || '',
            category || '',
            price || 0,
            is_popular ? 1 : 0,
            journey || '',          
            spices || '',           
            cooking_steps || ''    
        );
        const newDish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, data: newDish });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/dishes/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // TAMBAHKAN: journey, spices, cooking_steps di sini
        const { name, description, history, ingredients, nutrition, image, category, price, is_popular, journey, spices, cooking_steps } = req.body;

        // TAMBAHKAN kolom journey, spices, cooking_steps di query UPDATE
        const stmt = db.prepare(`
            UPDATE dishes 
            SET name=?, description=?, history=?, ingredients=?, nutrition=?, image=?, category=?, price=?, is_popular=?, journey=?, spices=?, cooking_steps=?
            WHERE id=?
        `);
        stmt.run(
            name,
            description,
            history || '',
            ingredients || '',
            nutrition || '',
            image || '',
            category || '',
            price || 0,
            is_popular ? 1 : 0,
            journey || '',          
            spices || '',           
            cooking_steps || '',   
            id
        );
        const updatedDish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(id);
        res.json({ success: true, data: updatedDish });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/dishes/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM dishes WHERE id = ?').run(id);
        res.json({ success: true, message: 'Dish deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// MENU ITEMS CRUD (Tabel: menu_items)
// Struktur: id, restaurant_id, name, description, category, price, rating, 
//           total_ratings, image_url, is_popular, is_available, is_vegetarian, is_spicy
// ==========================================
router.get('/menu-items', (req: AuthRequest, res: Response) => {
    try {
        const menuItems = db.prepare('SELECT * FROM menu_items ORDER BY created_at DESC').all();
        res.json({ success: true, data: menuItems });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/menu-items', (req: AuthRequest, res: Response) => {
    try {
        const {
            restaurant_id, name, description, category, price,
            rating, total_ratings, image_url,
            is_popular, is_available, is_vegetarian, is_spicy
        } = req.body;

        const stmt = db.prepare(`
      INSERT INTO menu_items 
      (restaurant_id, name, description, category, price, rating, total_ratings, 
       image_url, is_popular, is_available, is_vegetarian, is_spicy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            restaurant_id, name, description, category, price,
            rating || 0, total_ratings || 0, image_url || '',
            is_popular ? 1 : 0,
            is_available !== false ? 1 : 0,
            is_vegetarian ? 1 : 0,
            is_spicy ? 1 : 0
        );
        const newItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, data: newItem });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/menu-items/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const {
            restaurant_id, name, description, category, price,
            rating, total_ratings, image_url,
            is_popular, is_available, is_vegetarian, is_spicy
        } = req.body;

        const stmt = db.prepare(`
      UPDATE menu_items 
      SET restaurant_id=?, name=?, description=?, category=?, price=?, 
          rating=?, total_ratings=?, image_url=?, 
          is_popular=?, is_available=?, is_vegetarian=?, is_spicy=?
      WHERE id=?
    `);
        stmt.run(
            restaurant_id, name, description, category, price,
            rating || 0, total_ratings || 0, image_url || '',
            is_popular ? 1 : 0,
            is_available !== false ? 1 : 0,
            is_vegetarian ? 1 : 0,
            is_spicy ? 1 : 0,
            id
        );
        const updatedItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
        res.json({ success: true, data: updatedItem });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/menu-items/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
        res.json({ success: true, message: 'Menu item deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// PERSONALITY QUIZ CRUD
// ==========================================
router.get('/personality-questions', (req: AuthRequest, res: Response) => {
    try {
        const questions = db.prepare(`SELECT * FROM quiz_questions WHERE quiz_type = 'personality' ORDER BY id ASC`).all();
        const questionsWithOptions = questions.map((q: any) => {
            const options = db.prepare(`SELECT * FROM quiz_options WHERE question_id = ? ORDER BY option_letter ASC`).all(q.id);
            return { ...q, options };
        });
        res.json({ success: true, data: questionsWithOptions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/personality-questions', (req: AuthRequest, res: Response) => {
    try {
        const { question_text, options } = req.body;
        const qStmt = db.prepare(`INSERT INTO quiz_questions (quiz_type, question_text) VALUES ('personality', ?)`);
        const qResult = qStmt.run(question_text);
        const questionId = qResult.lastInsertRowid;

        const oStmt = db.prepare(`INSERT INTO quiz_options (question_id, option_text, option_letter, food_target, is_correct) VALUES (?, ?, ?, ?, 0)`);
        options.forEach((opt: any) => {
            oStmt.run(questionId, opt.option_text, opt.option_letter, opt.food_target);
        });

        const newQuestion = db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(questionId);
        const newOptions = db.prepare('SELECT * FROM quiz_options WHERE question_id = ?').all(questionId);
        res.status(201).json({ success: true, data: { ...newQuestion, options: newOptions } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/personality-questions/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { question_text, options } = req.body;
        db.prepare('UPDATE quiz_questions SET question_text = ? WHERE id = ?').run(question_text, id);
        db.prepare('DELETE FROM quiz_options WHERE question_id = ?').run(id);

        const oStmt = db.prepare(`INSERT INTO quiz_options (question_id, option_text, option_letter, food_target, is_correct) VALUES (?, ?, ?, ?, 0)`);
        options.forEach((opt: any) => {
            oStmt.run(id, opt.option_text, opt.option_letter, opt.food_target);
        });

        const updatedQuestion = db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(id);
        const updatedOptions = db.prepare('SELECT * FROM quiz_options WHERE question_id = ?').all(id);
        res.json({ success: true, data: { ...updatedQuestion, options: updatedOptions } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/personality-questions/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM quiz_options WHERE question_id = ?').run(id);
        db.prepare('DELETE FROM quiz_questions WHERE id = ?').run(id);
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// MAIN QUIZ CRUD
// ==========================================
router.get('/main-questions', (req: AuthRequest, res: Response) => {
    try {
        const questions = db.prepare(`SELECT * FROM quiz_questions WHERE quiz_type = 'main' ORDER BY id ASC`).all();
        const questionsWithOptions = questions.map((q: any) => {
            const options = db.prepare(`SELECT * FROM quiz_options WHERE question_id = ? ORDER BY option_letter ASC`).all(q.id);
            return { ...q, options };
        });
        res.json({ success: true, data: questionsWithOptions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/main-questions', (req: AuthRequest, res: Response) => {
    try {
        const { question_text, options } = req.body;
        const qStmt = db.prepare(`INSERT INTO quiz_questions (quiz_type, question_text) VALUES ('main', ?)`);
        const qResult = qStmt.run(question_text);
        const questionId = qResult.lastInsertRowid;

        const oStmt = db.prepare(`INSERT INTO quiz_options (question_id, option_text, option_letter, food_target, is_correct) VALUES (?, ?, ?, NULL, ?)`);
        options.forEach((opt: any) => {
            oStmt.run(questionId, opt.option_text, opt.option_letter, opt.is_correct ? 1 : 0);
        });

        const newQuestion = db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(questionId);
        const newOptions = db.prepare('SELECT * FROM quiz_options WHERE question_id = ?').all(questionId);
        res.status(201).json({ success: true, data: { ...newQuestion, options: newOptions } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/main-questions/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { question_text, options } = req.body;
        db.prepare('UPDATE quiz_questions SET question_text = ? WHERE id = ?').run(question_text, id);
        db.prepare('DELETE FROM quiz_options WHERE question_id = ?').run(id);

        const oStmt = db.prepare(`INSERT INTO quiz_options (question_id, option_text, option_letter, food_target, is_correct) VALUES (?, ?, ?, NULL, ?)`);
        options.forEach((opt: any) => {
            oStmt.run(id, opt.option_text, opt.option_letter, opt.is_correct ? 1 : 0);
        });

        const updatedQuestion = db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(id);
        const updatedOptions = db.prepare('SELECT * FROM quiz_options WHERE question_id = ?').all(id);
        res.json({ success: true, data: { ...updatedQuestion, options: updatedOptions } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/main-questions/:id', (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM quiz_options WHERE question_id = ?').run(id);
        db.prepare('DELETE FROM quiz_questions WHERE id = ?').run(id);
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// QUIZ RESULTS (View Only)
// ==========================================
router.get('/quiz-results', (req: AuthRequest, res: Response) => {
    try {
        const results = db.prepare(`
      SELECT qr.*, u.username, u.email 
      FROM quiz_results qr
      LEFT JOIN users u ON qr.user_id = u.id
      ORDER BY qr.created_at DESC
    `).all();
        res.json({ success: true, data: results });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
