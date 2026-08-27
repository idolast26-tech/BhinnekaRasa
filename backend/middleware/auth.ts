import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface agar TypeScript mengenal 'user'
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  }
}

// 1. Middleware untuk cek apakah user sudah login (punya token valid)
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'kuliner-medan-secret-2024', (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau kadaluarsa.' });
    }
    req.user = decoded; // Simpan data user (termasuk role) ke request
    next();
  });
};

// 2. Middleware untuk cek apakah user adalah ADMIN
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak. Hanya Administrator yang dapat mengakses fitur ini.' 
    });
  }

  next(); 
};