import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { addAuditLog, addSecurityAlert } from '../utils/auditLogger.js';
import { createUser, findUserByEmail, publicUser, updateUserLoginState } from '../utils/userRepository.js';
import { signToken } from '../utils/token.js';
import { loginSchema, registerSchema } from '../validators/authValidators.js';
import { loginLimiter } from '../middleware/rateLimitMiddleware.js';
import type { User } from '../types/index.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid request' });
    }

    const existingUser = await findUserByEmail(parsed.data.email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const newUser: User = {
      id: uuidv4(),
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      passwordHash: bcrypt.hashSync(parsed.data.password, 10),
      role: parsed.data.role ?? 'user',
      isLocked: false,
      failedLoginCount: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: undefined
    };

    const savedUser = await createUser(newUser);

    await addAuditLog({
      userId: savedUser.id,
      action: 'user_registered',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Account created for ${savedUser.email}`
    });

    return res.status(201).json({ user: publicUser(savedUser) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid request' });
    }

    const user = await findUserByEmail(parsed.data.email);

    if (!user) {
      await addAuditLog({
        action: 'login_failed',
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: `Unknown email: ${parsed.data.email}`
      });

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isLocked) {
      await addAuditLog({
        userId: user.id,
        action: 'locked_account_login_attempt',
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: 'Login attempted on locked account'
      });

      return res.status(423).json({ message: 'Account is locked. Contact an admin.' });
    }

    const passwordMatches = bcrypt.compareSync(parsed.data.password, user.passwordHash);

    if (!passwordMatches) {
      const failedLoginCount = user.failedLoginCount + 1;
      const shouldLock = failedLoginCount >= 5;

      const updatedUser = await updateUserLoginState(user.id, {
        failedLoginCount,
        isLocked: shouldLock
      });

      await addAuditLog({
        userId: updatedUser.id,
        action: 'login_failed',
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: `Failed login count: ${updatedUser.failedLoginCount}`
      });

      if (shouldLock) {
        await addSecurityAlert({
          userId: updatedUser.id,
          type: 'account_lockout',
          severity: 'high',
          description: `Account ${updatedUser.email} locked after repeated failed logins`
        });
      }

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const updatedUser = await updateUserLoginState(user.id, {
      failedLoginCount: 0,
      lastLoginAt: new Date().toISOString()
    });

    await addAuditLog({
      userId: updatedUser.id,
      action: 'login_success',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `User ${updatedUser.email} logged in successfully`
    });

    const token = signToken({ sub: updatedUser.id, role: updatedUser.role, email: updatedUser.email });

    return res.json({ token, user: publicUser(updatedUser) });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  return res.json({ message: 'Logout handled on the client in this demo.' });
});

router.post('/reset-password', (_req, res) => {
  return res.json({ message: 'Mock password reset endpoint. Extend with email flow later.' });
});

export default router;
