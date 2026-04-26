import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'AuthShield API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

export default app;
