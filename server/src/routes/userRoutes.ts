import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listAuditLogsByUser } from '../utils/auditLogger.js';
import { findUserById, publicUser } from '../utils/userRepository.js';

const router = Router();

router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', requireAuth, async (req, res, next) => {
  try {
    const logs = await listAuditLogsByUser(req.user!.id, 20);
    return res.json({ logs });
  } catch (error) {
    next(error);
  }
});

export default router;
