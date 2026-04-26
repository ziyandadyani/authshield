import jwt from 'jsonwebtoken';
import type { Role } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-change-me';

export function signToken(payload: { sub: string; role: Role; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string; role: Role; email: string };
}
