import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

import fs from 'fs';

app.get('/api/move-screenshots-temp', (req, res) => {
  try {
    const docsDir = 'E:/Secure rag/team-task-manager/docs';
    const screenshotsDir = `${docsDir}/screenshots`;
    
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const files = fs.readdirSync(docsDir);
    const moved = [];

    files.forEach(file => {
      if (file.startsWith('FireShot Capture') && file.endsWith('.png')) {
        const match = file.match(/FireShot Capture (\d+)/);
        const num = match ? match[1] : 'unknown';
        const newName = `ss_${num}.png`;
        
        const oldPath = `${docsDir}/${file}`;
        const newPath = `${screenshotsDir}/${newName}`;
        
        fs.renameSync(oldPath, newPath);
        moved.push({ from: file, to: newName });
      }
    });

    res.json({ success: true, message: 'Screenshots moved and renamed successfully', moved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'team-task-manager-api' });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Team Task Manager API',
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contracts', contractRoutes);

if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDistPath = path.resolve(__dirname, '../../client/dist');

  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
