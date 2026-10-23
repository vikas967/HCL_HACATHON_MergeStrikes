import { InventoryBatch } from '../models/InventoryBatch.js';

export const NEAR_EXPIRY_DAYS = Number(process.env.NEAR_EXPIRY_DAYS || 30);
export const CRITICAL_EXPIRY_DAYS = Number(process.env.CRITICAL_EXPIRY_DAYS || 7);

export async function listExpiringBatches({ thresholdDays = NEAR_EXPIRY_DAYS } = {}) {
  const now = Date.now();
  const horizon = new Date(now + thresholdDays * 86400000);
  const batches = await InventoryBatch.find({
    status: 'active',
    expiresOn: { $lte: horizon },
  })
    .populate('product warehouse')
    .lean();

  return batches
    .map((b) => {
      const daysToExpiry = Math.ceil((new Date(b.expiresOn).getTime() - now) / 86400000);
      let status = 'expired';
      if (daysToExpiry > CRITICAL_EXPIRY_DAYS) status = 'near_expiry';
      else if (daysToExpiry > 0) status = 'critical';
      return { ...b, daysToExpiry, status };
    })
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
