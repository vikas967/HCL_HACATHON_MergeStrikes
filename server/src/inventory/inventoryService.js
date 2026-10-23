import { Inventory } from '../models/Inventory.js';
import { StockMovement } from '../models/StockMovement.js';
import { AuditLog } from '../models/AuditLog.js';
import { HttpError } from '../middleware/error.js';

export async function listInventory({ warehouseId, lowStockOnly = false } = {}) {
  const query = {};
  if (warehouseId) query.warehouse = warehouseId;
  const items = await Inventory.find(query).populate('product warehouse').lean();
  const result = items.map((i) => {
    const available = Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0));
    const status =
      available === 0 ? 'out_of_stock' : available <= i.reorderPoint ? 'low_stock' : 'in_stock';
    return { ...i, available, status };
  });
  return lowStockOnly ? result.filter((r) => r.status !== 'in_stock') : result;
}

export async function listLowStock() {
  const items = await listInventory();
  return items
    .filter((i) => i.status !== 'in_stock')
    .map((i) => ({
      productId: i.product?._id,
      productName: i.product?.name,
      warehouseId: i.warehouse?._id,
      warehouseName: i.warehouse?.name,
      available: i.available,
      reorderPoint: i.reorderPoint,
      targetStockLevel: i.targetStockLevel,
      suggestedReplenishment: Math.max(0, (i.targetStockLevel || 50) - i.available),
      risk: i.available === 0 ? 'critical' : i.available < i.reorderPoint / 2 ? 'high' : 'medium',
    }))
    .sort((a, b) => a.available - b.available);
}

export async function adjustStock({ productId, warehouseId, delta, reason, performedBy }) {
  if (!Number.isFinite(delta) || delta === 0) throw new HttpError(400, 'delta must be a non-zero number');
  if (!reason || reason.length < 3) throw new HttpError(400, 'reason is required');

  const inv = await Inventory.findOne({ product: productId, warehouse: warehouseId });
  if (!inv) throw new HttpError(404, 'Inventory record not found');

  const newOnHand = inv.onHand + delta;
  if (newOnHand < 0) throw new HttpError(400, 'Adjustment would produce negative inventory');
  const minimum = inv.reserved + inv.unavailable;
  if (newOnHand < minimum) {
    throw new HttpError(400, `onHand (${newOnHand}) cannot be less than reserved + unavailable (${minimum})`);
  }

  inv.onHand = newOnHand;
  await inv.save();

  await StockMovement.create({
    product: productId,
    warehouse: warehouseId,
    type: 'adjustment',
    delta,
    reason,
    performedBy,
  });
  await AuditLog.create({
    actor: performedBy,
    action: 'inventory.adjust',
    target: `${productId}@${warehouseId}`,
    details: { delta, reason, newOnHand },
  });

  return inv.toObject({ virtuals: true });
}

export async function operationsOverview() {
  const items = await listInventory();
  const totalProducts = new Set(items.map((i) => String(i.product?._id))).size;
  const totalUnits = items.reduce((s, i) => s + (i.onHand || 0), 0);
  const lowStock = items.filter((i) => i.status !== 'in_stock').length;
  const outOfStock = items.filter((i) => i.status === 'out_of_stock').length;
  return { totalProducts, totalUnits, lowStock, outOfStock };
}
