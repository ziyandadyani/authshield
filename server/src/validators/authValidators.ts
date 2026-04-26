import { z } from 'zod';

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().regex(passwordRule, 'Password must be at least 8 characters and include upper, lower, number, and special character'),
  role: z.enum(['user', 'admin']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});
