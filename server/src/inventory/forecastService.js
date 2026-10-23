import { HistoricalSales } from '../models/HistoricalSales.js';
import { Inventory } from '../models/Inventory.js';

export async function computeForecast(productId, { windowDays = 14 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const sales = await HistoricalSales.find({ product: productId, date: { $gte: since } })
    .sort({ date: 1 })
    .lean();

  const totalUnits = sales.reduce((s, r) => s + r.unitsSold, 0);
  const avgDailyDemand = sales.length ? totalUnits / windowDays : 0;

  const inventories = await Inventory.find({ product: productId }).lean();
  const totalAvailable = inventories.reduce(
    (s, i) => s + Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0)),
    0
  );

  const daysToStockout = avgDailyDemand > 0 ? totalAvailable / avgDailyDemand : Infinity;
  const suggestedReorder = Math.max(0, Math.round(avgDailyDemand * 30 - totalAvailable));

  return {
    productId: String(productId),
    windowDays,
    history: sales.map((s) => ({ date: s.date, units: s.unitsSold })),
    totalUnitsInWindow: totalUnits,
    avgDailyDemand: Number(avgDailyDemand.toFixed(2)),
    availableInventory: totalAvailable,
    daysToStockout: Number.isFinite(daysToStockout) ? Number(daysToStockout.toFixed(1)) : null,
    suggestedReorder,
    note: 'Rough baseline estimate from recent moving average. Not statistically validated.',
  };
}

export async function listForecasts({ limit = 20 } = {}) {
  const inventories = await Inventory.find().populate('product').lean();
  const byProduct = new Map();
  for (const i of inventories) {
    if (!i.product) continue;
    const id = String(i.product._id);
    const avail = Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0));
    byProduct.set(id, { product: i.product, available: (byProduct.get(id)?.available || 0) + avail });
  }
  const results = [];
  for (const [, entry] of byProduct) {
    const f = await computeForecast(entry.product._id);
    results.push({ product: entry.product, ...f });
  }
  results.sort((a, b) => (a.daysToStockout ?? 9e9) - (b.daysToStockout ?? 9e9));
  return results.slice(0, limit);
}
