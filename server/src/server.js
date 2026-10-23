import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { startScheduledJobs } from './utils/scheduler.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  startScheduledJobs();
  app.listen(PORT, () => {
    console.log(`[server] ShopSmart AI listening on http://localhost:${PORT}`);
    console.log(`[server] API base: http://localhost:${PORT}/api`);
    console.log(`[server] Health:   http://localhost:${PORT}/api/health`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
