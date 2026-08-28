import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import chatRouter from './routes/chat.js';  
import reviewsRouter from './routes/reviews.js';
import quizRouter from './routes/quiz.js'; 
import quizResultsRouter from './routes/quizResults.js';
import adminRouter from './routes/admin.js';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Izinkan localhost dev + domain Vercel production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL, // set di Render env vars
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (mobile app, curl, dll)
    if (!origin) return callback(null, true)
    // Izinkan semua subdomain vercel.app
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRouter);  
app.use('/api/reviews', reviewsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/quiz-results', quizResultsRouter);
app.use('/api/ai', aiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send(' Kuliner Medan Food Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
