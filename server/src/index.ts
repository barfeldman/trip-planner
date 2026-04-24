import express from 'express';
import cors from 'cors';
import path from 'path';
import { tripRoutes } from './routes/trips';
import { dayRoutes } from './routes/days';
import { accommodationRoutes } from './routes/accommodations';
import { activityRoutes } from './routes/activities';
import { budgetRoutes } from './routes/budget';
import { transportRoutes } from './routes/transports';
import { packingRoutes } from './routes/packing';
import { documentRoutes } from './routes/documents';
import { noteRoutes } from './routes/notes';
import { destinationRoutes } from './routes/destinations';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/trips', tripRoutes);
app.use('/api/days', dayRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/transports', transportRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/destinations', destinationRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌴 Trip Planner API running on http://localhost:${PORT}`);
});
