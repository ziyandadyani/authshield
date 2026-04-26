import { NextFunction, Request, Response } from 'express';
import { findUserById } from '../utils/userRepository.js';
import { verifyToken } from '../utils/token.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'user' | 'admin';
        email: string;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}