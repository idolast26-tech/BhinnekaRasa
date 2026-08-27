import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/quiz?type=personality | main
router.get('/', (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    if (!type || (type !== 'personality' && type !== 'main')) {
      return res.status(400).json({ success: false, message: 'Tipe kuis tidak valid' });
    }

    const questions = db.prepare(`
      SELECT id, question_text FROM quiz_questions WHERE quiz_type = ?
    `).all(type);

    const questionsWithOptions = questions.map((q: any) => {
      const options = db.prepare(`
        SELECT id, option_text, option_letter, food_target, is_correct 
        FROM quiz_options WHERE question_id = ? ORDER BY option_letter ASC
      `).all(q.id);
      return { ...q, options };
    });

    res.json({ success: true, data: questionsWithOptions });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;