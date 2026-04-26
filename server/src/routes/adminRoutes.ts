import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { addAuditLog, listAuditLogs, listSecurityAlerts } from '../utils/auditLogger.js';
import { findUserById, listUsers, publicUser, updateUserLoginState } from '../utils/userRepository.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', async (_req, res, next) => {
  try {
    const users = await listUsers();
    return res.json({ users: users.map(publicUser) });
  } catch (error) {
    next(error);
  }
});

router.get('/logs', async (_req, res, next) => {
  try {
    const logs = await listAuditLogs(100);
    return res.json({ logs });
  } catch (error) {
    next(error);
  }
});

router.get('/alerts', async (_req, res, next) => {
  try {
    const alerts = await listSecurityAlerts(100);
    return res.json({ alerts });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/lock', async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await updateUserLoginState(user.id, { isLocked: true });

    await addAuditLog({
      userId: updatedUser.id,
      action: 'admin_locked_account',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Admin locked ${updatedUser.email}`
    });

    return res.json({ user: publicUser(updatedUser) });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/unlock', async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await updateUserLoginState(user.id, {
      isLocked: false,
      failedLoginCount: 0
    });

    await addAuditLog({
      userId: updatedUser.id,
      action: 'admin_unlocked_account',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: `Admin unlocked ${updatedUser.email}`
    });

    return res.json({ user: publicUser(updatedUser) });
  } catch (error) {
    next(error);
  }
});

export default router;