import { generateText } from './geminiService.js';
import { Inventory } from '../models/Inventory.js';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { Product } from '../models/Product.js';
import { Warehouse } from '../models/Warehouse.js';
import { computeForecast } from '../inventory/forecastService.js';

export async function answerOpsQuestion(question) {
  const [inv, batches, warehouses, products] = await Promise.all([
    Inventory.find().populate('product warehouse').lean(),
    InventoryBatch.find({ status: 'active' }).populate('product warehouse').lean(),
    Warehouse.find().lean(),
    Product.find().lean(),
  ]);

  const now = Date.now();
  const lowStock = inv
    .filter((i) => {
      const avail = Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0));
      return avail <= (i.reorderPoint || 10);
    })
    .map((i) => ({
      product: i.product?.name,
      warehouse: i.warehouse?.name,
      available: Math.max(0, (i.onHand || 0) - (i.reserved || 0) - (i.unavailable || 0)),
      reorderPoint: i.reorderPoint,
      targetStockLevel: i.targetStockLevel,
    }));

  const nearExpiry = batches
    .filter((b) => {
      const days = Math.ceil((new Date(b.expiresOn).getTime() - now) / 86400000);
      return days <= 30;
    })
    .map((b) => ({
      product: b.product?.name,
      warehouse: b.warehouse?.name,
      daysToExpiry: Math.ceil((new Date(b.expiresOn).getTime() - now) / 86400000),
      quantity: b.quantity,
    }));

  const topRestockPriorities = [];
  for (const l of lowStock.slice(0, 10)) {
    const product = products.find((p) => p.name === l.product);
    if (!product) continue;
    const f = await computeForecast(product._id);
    topRestockPriorities.push({
      product: l.product,
      warehouse: l.warehouse,
      available: l.available,
      avgDailyDemand: f.avgDailyDemand,
      daysToStockout: f.daysToStockout,
      suggestedReorder: Math.max(0, (l.targetStockLevel || 50) - l.available),
    });
  }
  topRestockPriorities.sort((a, b) => a.daysToStockout - b.daysToStockout);

  const metrics = {
    totalProducts: products.length,
    totalWarehouses: warehouses.length,
    lowStockCount: lowStock.length,
    nearExpiryCount: nearExpiry.length,
    topRestockPriorities: topRestockPriorities.slice(0, 8),
    topNearExpiry: nearExpiry.slice(0, 6),
  };

  const prompt = `Operations question: ${question}

Current ops metrics (computed from live DB):
${JSON.stringify(metrics, null, 2)}

Answer in 3-6 short bullet points. Reference specific products, warehouses, and numbers from the metrics. Do not invent data. If the metrics don't cover the question, say so. Keep tone professional and concise.`;

  const result = await generateText({
    system:
      'You are an operations analyst for an Indian e-commerce platform. Explain and recommend based ONLY on the metrics provided. Never propose directly modifying inventory — always say "an authorized admin should perform the adjustment".',
    prompt,
    temperature: 0.25,
    maxOutputTokens: 700,
  });

  if (!result.ok) {
    return {
      answer:
        'The AI service is briefly unavailable. Based on the computed metrics, prioritise restocking:\n' +
        metrics.topRestockPriorities
          .slice(0, 5)
          .map((p) => `• ${p.product} at ${p.warehouse} — ${p.available} units left, ~${p.daysToStockout} days`)
          .join('\n'),
      metrics,
      fallback: true,
    };
  }
  return { answer: result.text.trim(), metrics };
}

export async function checkoutAssistant({ cartItems, budget }) {
  const items = cartItems.map((i) => ({
    name: i.product?.name || i.nameSnapshot,
    price: i.product?.price || i.priceSnapshot,
    quantity: i.quantity,
    category: i.product?.category,
    rating: i.product?.rating,
    brand: i.product?.brand,
  }));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const alternatives = [];
  for (const item of items) {
    const cheaper = await Product.find({
      category: item.category,
      price: { $lt: item.price },
      available: true,
    })
      .sort({ price: 1, rating: -1 })
      .limit(2)
      .lean();
    if (cheaper.length) {
      alternatives.push({
        original: item.name,
        originalPrice: item.price,
        suggestions: cheaper.map((c) => ({
          name: c.name,
          brand: c.brand,
          price: c.price,
          rating: c.rating,
          savings: item.price - c.price,
        })),
      });
    }
  }

  const prompt = `Shopper's cart (subtotal ₹${subtotal}, budget ₹${budget || 'not specified'}):
${JSON.stringify(items, null, 2)}

Cheaper alternatives available in the same categories:
${JSON.stringify(alternatives, null, 2)}

Return a short checkout advisory (under 100 words):
- Is the cart within budget?
- If over budget, which 1-2 swaps help most? Reference items by name.
- If within budget, affirm and highlight the best savings opportunity if any.
Do not invent prices or products.`;

  const result = await generateText({
    system: 'You are a friendly checkout assistant. Help the shopper stay within budget. Only reference items and prices given.',
    prompt,
    temperature: 0.3,
    maxOutputTokens: 400,
  });

  const overBudget = budget ? subtotal > budget : false;
  if (!result.ok) {
    return {
      advice: overBudget
        ? `Your cart (₹${subtotal}) is over your budget (₹${budget}). ${
            alternatives.length ? 'See suggested cheaper alternatives below.' : 'Consider removing a non-essential item.'
          }`
        : `Your cart (₹${subtotal}) is within budget. ${alternatives.length ? 'There are a few cheaper alternatives if you want to save more.' : ''}`,
      subtotal,
      overBudget,
      alternatives,
      fallback: true,
    };
  }
  return { advice: result.text.trim(), subtotal, overBudget, alternatives };
}
