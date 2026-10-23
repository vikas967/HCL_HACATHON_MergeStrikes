import { listLowStock } from '../inventory/inventoryService.js';
import { listExpiringBatches } from '../inventory/expiryService.js';

export function startScheduledJobs() {
  if (process.env.NODE_ENV === 'test') return;
  const interval = Number(process.env.SCHEDULED_INTERVAL_MS || 1000 * 60 * 60); // 1 hour

  const run = async () => {
    try {
      const low = await listLowStock();
      if (low.length) {
        console.log(`[scheduler] ${low.length} products below reorder point.`);
      }
      const expiring = await listExpiringBatches();
      if (expiring.length) {
        console.log(`[scheduler] ${expiring.length} batches near/past expiry.`);
      }
    } catch (err) {
      console.error('[scheduler] run failed:', err.message);
    }
  };

  setTimeout(run, 5000);
  setInterval(run, interval);
}
