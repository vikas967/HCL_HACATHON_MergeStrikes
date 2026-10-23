import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Warehouse } from '../src/models/Warehouse.js';
import { Inventory } from '../src/models/Inventory.js';
import { InventoryBatch } from '../src/models/InventoryBatch.js';
import { HistoricalSales } from '../src/models/HistoricalSales.js';
import { Promotion } from '../src/models/Promotion.js';
import { Order } from '../src/models/Order.js';
import { PolicyDocument } from '../src/models/PolicyDocument.js';
import { PolicyChunk } from '../src/models/PolicyChunk.js';
import { ingestDocument } from '../src/rag/documentProcessor.js';

const IMG = (q) => `https://picsum.photos/seed/${encodeURIComponent(q)}/600/400`;

const PRODUCTS = [
  // Electronics - Laptops
  { sku: 'LTP-001', name: 'Lenovo IdeaPad Slim 3 (i5, 16GB)', category: 'Electronics', subcategory: 'laptop', brand: 'Lenovo', price: 56999, originalPrice: 64999, rating: 4.3, reviewCount: 1240, specifications: { CPU: 'Intel Core i5-12450H', RAM: '16GB DDR4', Storage: '512GB SSD', Display: '15.6" FHD', OS: 'Windows 11' }, tags: ['laptop','coding','student','programming','java'], useCases: ['Java development','student','general use'], description: 'Thin and light laptop ideal for coding and productivity.' },
  { sku: 'LTP-002', name: 'HP Pavilion 14 (Ryzen 5, 16GB)', category: 'Electronics', subcategory: 'laptop', brand: 'HP', price: 62499, originalPrice: 72999, rating: 4.4, reviewCount: 2103, specifications: { CPU: 'AMD Ryzen 5 7530U', RAM: '16GB DDR4', Storage: '512GB SSD', Display: '14" FHD', OS: 'Windows 11' }, tags: ['laptop','coding','ai','programming'], useCases: ['Java development','beginner AI projects','productivity'], description: 'Compact laptop with excellent battery life for developers.' },
  { sku: 'LTP-003', name: 'Dell Inspiron 15 (i7, 16GB, RTX 3050)', category: 'Electronics', subcategory: 'laptop', brand: 'Dell', price: 78990, originalPrice: 89999, rating: 4.2, reviewCount: 980, specifications: { CPU: 'Intel Core i7-13620H', RAM: '16GB DDR5', Storage: '1TB SSD', Display: '15.6" FHD 120Hz', GPU: 'RTX 3050 6GB', OS: 'Windows 11' }, tags: ['laptop','ai','gaming','ml','gpu'], useCases: ['AI/ML development','gaming','video editing'], description: 'Powerful laptop with dedicated GPU for AI workloads.' },
  { sku: 'LTP-004', name: 'ASUS Vivobook 15 (i3, 8GB)', category: 'Electronics', subcategory: 'laptop', brand: 'ASUS', price: 38999, originalPrice: 44999, rating: 4.1, reviewCount: 1560, specifications: { CPU: 'Intel Core i3-1215U', RAM: '8GB', Storage: '512GB SSD', Display: '15.6" FHD', OS: 'Windows 11' }, tags: ['laptop','budget','student'], useCases: ['student','office work','browsing'], description: 'Affordable everyday laptop for students.' },
  { sku: 'LTP-005', name: 'Apple MacBook Air M2 (8GB)', category: 'Electronics', subcategory: 'laptop', brand: 'Apple', price: 99900, originalPrice: 114900, rating: 4.7, reviewCount: 3200, specifications: { CPU: 'Apple M2', RAM: '8GB', Storage: '256GB SSD', Display: '13.6" Liquid Retina', OS: 'macOS' }, tags: ['laptop','macbook','premium'], useCases: ['development','design','video editing'], description: 'Ultra-portable premium laptop with best-in-class battery.' },
  { sku: 'LTP-006', name: 'Acer Aspire 7 (i5, RTX 2050)', category: 'Electronics', subcategory: 'laptop', brand: 'Acer', price: 65990, originalPrice: 74999, rating: 4.2, reviewCount: 712, specifications: { CPU: 'Intel Core i5-12450H', RAM: '16GB DDR4', Storage: '512GB SSD', GPU: 'RTX 2050', Display: '15.6" FHD' }, tags: ['laptop','ai','entry gaming'], useCases: ['beginner AI projects','gaming','programming'], description: 'Mid-range laptop with GPU for entry-level AI and gaming.' },

  // Electronics - Phones
  { sku: 'PHN-001', name: 'Samsung Galaxy M14 5G (6GB/128GB)', category: 'Electronics', subcategory: 'phone', brand: 'Samsung', price: 13490, originalPrice: 16999, rating: 4.1, reviewCount: 5620, specifications: { RAM: '6GB', Storage: '128GB', Battery: '6000mAh', Display: '6.6" FHD+', '5G': 'Yes' }, tags: ['phone','5g','budget'], useCases: ['everyday use','calls','social media'], description: 'Budget 5G phone with large battery.' },
  { sku: 'PHN-002', name: 'Redmi Note 13 Pro 5G (8GB/256GB)', category: 'Electronics', subcategory: 'phone', brand: 'Xiaomi', price: 25999, originalPrice: 28999, rating: 4.3, reviewCount: 4320, specifications: { RAM: '8GB', Storage: '256GB', Battery: '5100mAh', Camera: '200MP', Display: '6.67" AMOLED 120Hz' }, tags: ['phone','5g','camera','amoled'], useCases: ['photography','gaming','daily use'], description: 'Feature-packed mid-range 5G phone.' },
  { sku: 'PHN-003', name: 'OnePlus Nord CE 3 Lite', category: 'Electronics', subcategory: 'phone', brand: 'OnePlus', price: 19999, originalPrice: 22999, rating: 4.2, reviewCount: 2890, specifications: { RAM: '8GB', Storage: '128GB', Battery: '5000mAh', Camera: '108MP', Display: '6.72" 120Hz LCD' }, tags: ['phone','5g','oneplus'], useCases: ['daily use','light gaming'], description: 'Smooth, dependable OnePlus mid-ranger.' },
  { sku: 'PHN-004', name: 'iPhone 13 (128GB)', category: 'Electronics', subcategory: 'phone', brand: 'Apple', price: 49999, originalPrice: 69900, rating: 4.6, reviewCount: 8900, specifications: { Chip: 'A15 Bionic', Storage: '128GB', Camera: 'Dual 12MP', Display: '6.1" Super Retina XDR', OS: 'iOS' }, tags: ['phone','iphone','premium'], useCases: ['photography','daily use','gaming'], description: 'Reliable iPhone with great camera and performance.' },

  // Electronics - Headphones
  { sku: 'HPH-001', name: 'Sony WH-CH520 Wireless', category: 'Electronics', subcategory: 'headphones', brand: 'Sony', price: 3990, originalPrice: 5490, rating: 4.3, reviewCount: 2100, specifications: { Type: 'On-ear wireless', Battery: '50hr', BT: '5.2' }, tags: ['headphones','wireless','affordable'], useCases: ['music','calls'], description: 'Lightweight wireless headphones with long battery.' },
  { sku: 'HPH-002', name: 'boAt Rockerz 450', category: 'Electronics', subcategory: 'headphones', brand: 'boAt', price: 1499, originalPrice: 2499, rating: 4.1, reviewCount: 15200, specifications: { Type: 'On-ear wireless', Battery: '15hr' }, tags: ['headphones','budget','wireless'], useCases: ['music','everyday'], description: 'Popular budget wireless headphones.' },
  { sku: 'HPH-003', name: 'Sony WH-1000XM5 Noise Cancelling', category: 'Electronics', subcategory: 'headphones', brand: 'Sony', price: 26990, originalPrice: 34990, rating: 4.7, reviewCount: 1890, specifications: { Type: 'Over-ear wireless', Battery: '30hr', ANC: 'Industry-leading' }, tags: ['headphones','anc','premium','travel'], useCases: ['travel','work from home','music'], description: 'Flagship noise-cancelling headphones.' },

  // Electronics - TVs
  { sku: 'TV-001', name: 'Mi 32" HD Smart TV', category: 'Electronics', subcategory: 'tv', brand: 'Xiaomi', price: 13999, originalPrice: 19999, rating: 4.3, reviewCount: 7700, specifications: { Resolution: 'HD Ready', OS: 'Android TV', Size: '32"' }, tags: ['tv','smart','budget'], useCases: ['bedroom','small living room'], description: '32-inch budget-friendly smart TV.' },
  { sku: 'TV-002', name: 'Samsung Crystal 55" 4K UHD', category: 'Electronics', subcategory: 'tv', brand: 'Samsung', price: 42990, originalPrice: 58900, rating: 4.4, reviewCount: 3200, specifications: { Resolution: '4K UHD', OS: 'Tizen', Size: '55"' }, tags: ['tv','4k','smart'], useCases: ['living room','family'], description: '4K smart TV with crisp picture quality.' },

  // Electronics - Camera
  { sku: 'CAM-001', name: 'Canon EOS R50 Mirrorless', category: 'Electronics', subcategory: 'camera', brand: 'Canon', price: 68990, originalPrice: 78990, rating: 4.5, reviewCount: 320, specifications: { Sensor: '24.2MP APS-C', Video: '4K', Mount: 'RF' }, tags: ['camera','mirrorless','vlogging'], useCases: ['photography','vlogging'], description: 'Compact mirrorless camera for creators.' },

  // Fashion
  { sku: 'SHO-001', name: 'Nike Revolution 6 Running Shoes', category: 'Fashion', subcategory: 'shoes', brand: 'Nike', price: 2799, originalPrice: 3995, rating: 4.3, reviewCount: 1890, specifications: { Type: 'Running', Material: 'Mesh', Closure: 'Lace-up' }, tags: ['shoes','running','sport','comfortable'], useCases: ['running','gym','everyday'], description: 'Comfortable running shoes for daily workouts.' },
  { sku: 'SHO-002', name: 'Adidas Lite Racer Adapt', category: 'Fashion', subcategory: 'shoes', brand: 'Adidas', price: 2499, originalPrice: 3499, rating: 4.2, reviewCount: 1420, specifications: { Type: 'Slip-on', Material: 'Textile' }, tags: ['shoes','slip-on','casual','comfortable'], useCases: ['casual wear','walking'], description: 'Slip-on sneakers with cloud-like comfort.' },
  { sku: 'SHO-003', name: 'Puma Softride Flex Trainer', category: 'Fashion', subcategory: 'shoes', brand: 'Puma', price: 2999, originalPrice: 4499, rating: 4.3, reviewCount: 980, specifications: { Type: 'Training', Material: 'Mesh+Synthetic' }, tags: ['shoes','running','training','comfortable'], useCases: ['gym','running','walking'], description: 'Versatile trainer with soft cushioning.' },
  { sku: 'SHO-004', name: 'Bata Formal Oxford Shoes', category: 'Fashion', subcategory: 'shoes', brand: 'Bata', price: 1799, originalPrice: 2599, rating: 4.1, reviewCount: 540, specifications: { Type: 'Formal', Material: 'Leather' }, tags: ['shoes','formal','office'], useCases: ['office','formal events'], description: 'Classic formal oxfords for professionals.' },
  { sku: 'SHO-005', name: 'Woodland Trekking Boots', category: 'Fashion', subcategory: 'shoes', brand: 'Woodland', price: 3499, originalPrice: 4999, rating: 4.3, reviewCount: 760, specifications: { Type: 'Boots', Material: 'Leather', Sole: 'Rugged' }, tags: ['boots','outdoor','trekking'], useCases: ['hiking','trekking'], description: 'Durable trekking boots for outdoor adventures.' },
  { sku: 'FSN-001', name: 'Levi\'s 511 Slim Fit Jeans', category: 'Fashion', subcategory: 'jeans', brand: "Levi's", price: 2499, originalPrice: 3499, rating: 4.4, reviewCount: 2100, specifications: { Fit: 'Slim', Material: 'Cotton Blend' }, tags: ['jeans','slim-fit','casual'], useCases: ['everyday','casual'], description: 'Iconic slim-fit jeans.' },
  { sku: 'FSN-002', name: 'Allen Solly Formal Shirt', category: 'Fashion', subcategory: 'shirt', brand: 'Allen Solly', price: 1299, originalPrice: 1999, rating: 4.2, reviewCount: 1480, specifications: { Fit: 'Regular', Material: 'Cotton' }, tags: ['shirt','formal','office'], useCases: ['office','formal'], description: 'Comfortable formal shirt for the office.' },
  { sku: 'FSN-003', name: 'H&M Cotton T-Shirt', category: 'Fashion', subcategory: 't-shirt', brand: 'H&M', price: 599, originalPrice: 899, rating: 4.1, reviewCount: 870, specifications: { Fit: 'Regular', Material: '100% Cotton' }, tags: ['tshirt','casual'], useCases: ['everyday'], description: 'Soft cotton t-shirt for daily wear.' },

  // Home appliances
  { sku: 'WM-001', name: 'LG 7kg Fully Automatic Front Load WM', category: 'Home', subcategory: 'washing_machine', brand: 'LG', price: 32990, originalPrice: 42990, rating: 4.5, reviewCount: 1240, specifications: { Capacity: '7kg', Type: 'Front Load', Programs: '14', Energy: '5-Star' }, tags: ['washing machine','family','5-star','front load'], useCases: ['family of 4','daily washing'], description: 'Energy-efficient front-load washer for small families.' },
  { sku: 'WM-002', name: 'Whirlpool 6.5kg Top Load WM', category: 'Home', subcategory: 'washing_machine', brand: 'Whirlpool', price: 18490, originalPrice: 23490, rating: 4.3, reviewCount: 2100, specifications: { Capacity: '6.5kg', Type: 'Top Load', Programs: '12', Energy: '4-Star' }, tags: ['washing machine','top load','budget'], useCases: ['family of 2-3','daily washing'], description: 'Affordable top-load washing machine.' },
  { sku: 'WM-003', name: 'Samsung 8kg Front Load Washer', category: 'Home', subcategory: 'washing_machine', brand: 'Samsung', price: 38990, originalPrice: 49990, rating: 4.4, reviewCount: 890, specifications: { Capacity: '8kg', Type: 'Front Load', Programs: '14', Energy: '5-Star' }, tags: ['washing machine','family','large capacity'], useCases: ['family of 4-5','heavy loads'], description: 'Large-capacity front-load washer for bigger families.' },
  { sku: 'REF-001', name: 'LG 260L Double Door Refrigerator', category: 'Home', subcategory: 'refrigerator', brand: 'LG', price: 24990, originalPrice: 31990, rating: 4.4, reviewCount: 1310, specifications: { Capacity: '260L', Type: 'Double Door', Energy: '3-Star' }, tags: ['fridge','refrigerator','family'], useCases: ['family use','small-medium family'], description: 'Reliable double-door fridge.' },
  { sku: 'MW-001', name: 'IFB 20L Convection Microwave', category: 'Home', subcategory: 'microwave', brand: 'IFB', price: 11990, originalPrice: 15990, rating: 4.3, reviewCount: 940, specifications: { Capacity: '20L', Type: 'Convection' }, tags: ['microwave','cooking','baking'], useCases: ['baking','reheating'], description: 'Versatile convection microwave for small kitchens.' },
  { sku: 'AC-001', name: 'Daikin 1.5 Ton 5-Star Inverter AC', category: 'Home', subcategory: 'ac', brand: 'Daikin', price: 42990, originalPrice: 54990, rating: 4.6, reviewCount: 1890, specifications: { Capacity: '1.5 Ton', Type: 'Inverter Split', Energy: '5-Star' }, tags: ['ac','cooling','inverter','5-star'], useCases: ['bedroom','living room'], description: 'Efficient inverter AC with low power consumption.' },
  { sku: 'VC-001', name: 'Dyson V8 Cordless Vacuum', category: 'Home', subcategory: 'vacuum', brand: 'Dyson', price: 29900, originalPrice: 36900, rating: 4.5, reviewCount: 420, specifications: { Type: 'Cordless Stick', Battery: '40min' }, tags: ['vacuum','cordless','premium'], useCases: ['home cleaning'], description: 'Premium cordless vacuum.' },

  // Books
  { sku: 'BK-001', name: 'Atomic Habits (James Clear)', category: 'Books', subcategory: 'non-fiction', brand: 'Random House', price: 399, originalPrice: 699, rating: 4.7, reviewCount: 23400, specifications: { Pages: '320', Language: 'English', Format: 'Paperback' }, tags: ['book','self-help','bestseller'], useCases: ['self-improvement','reading'], description: 'Bestselling guide to building habits that stick.' },
  { sku: 'BK-002', name: 'Deep Learning with Python (Chollet)', category: 'Books', subcategory: 'tech', brand: 'Manning', price: 1499, originalPrice: 1899, rating: 4.6, reviewCount: 980, specifications: { Pages: '450', Language: 'English', Format: 'Paperback' }, tags: ['book','ai','ml','python','deep learning'], useCases: ['AI learning','programming'], description: 'Hands-on introduction to deep learning with Keras.' },
  { sku: 'BK-003', name: 'Effective Java (3rd Ed., Joshua Bloch)', category: 'Books', subcategory: 'tech', brand: 'Addison-Wesley', price: 999, originalPrice: 1299, rating: 4.8, reviewCount: 1540, specifications: { Pages: '416', Language: 'English', Format: 'Paperback' }, tags: ['book','java','programming','development'], useCases: ['Java development','best practices'], description: 'Must-read for serious Java developers.' },
  { sku: 'BK-004', name: 'Clean Code (Robert C. Martin)', category: 'Books', subcategory: 'tech', brand: "O'Reilly", price: 899, originalPrice: 1199, rating: 4.7, reviewCount: 2890, specifications: { Pages: '464', Language: 'English', Format: 'Paperback' }, tags: ['book','programming','best-practices'], useCases: ['software engineering'], description: 'Classic on writing readable, maintainable code.' },
  { sku: 'BK-005', name: 'Ikigai (Hector Garcia)', category: 'Books', subcategory: 'non-fiction', brand: 'Penguin', price: 299, originalPrice: 399, rating: 4.5, reviewCount: 18200, specifications: { Pages: '208', Format: 'Paperback' }, tags: ['book','self-help','japanese'], useCases: ['reading','mindfulness'], description: 'Japanese secret to a long and happy life.' },
  { sku: 'BK-006', name: 'The Alchemist (Paulo Coelho)', category: 'Books', subcategory: 'fiction', brand: 'HarperCollins', price: 249, originalPrice: 350, rating: 4.6, reviewCount: 42000, specifications: { Pages: '163', Format: 'Paperback' }, tags: ['book','fiction','classic'], useCases: ['reading'], description: 'A timeless fable about following your dreams.' },

  // Groceries (perishable → batches with expiry)
  { sku: 'GRC-001', name: 'Amul Toned Milk 1L', category: 'Groceries', subcategory: 'dairy', brand: 'Amul', price: 68, originalPrice: 70, rating: 4.5, reviewCount: 9200, specifications: { Volume: '1L', Fat: '3%' }, tags: ['milk','dairy','daily'], useCases: ['daily use','cooking'], description: 'Fresh toned milk.', perishable: true },
  { sku: 'GRC-002', name: 'Tata Salt 1kg', category: 'Groceries', subcategory: 'staple', brand: 'Tata', price: 28, originalPrice: 32, rating: 4.6, reviewCount: 5300, specifications: { Weight: '1kg', Type: 'Iodised' }, tags: ['salt','cooking'], useCases: ['cooking'], description: 'Iodised cooking salt.' },
  { sku: 'GRC-003', name: 'Fortune Sunflower Oil 1L', category: 'Groceries', subcategory: 'oil', brand: 'Fortune', price: 149, originalPrice: 180, rating: 4.3, reviewCount: 3800, specifications: { Volume: '1L', Type: 'Refined Sunflower' }, tags: ['oil','cooking'], useCases: ['cooking'], description: 'Light sunflower oil for everyday cooking.', perishable: true },
  { sku: 'GRC-004', name: 'Aashirvaad Atta 5kg', category: 'Groceries', subcategory: 'staple', brand: 'Aashirvaad', price: 275, originalPrice: 310, rating: 4.5, reviewCount: 7100, specifications: { Weight: '5kg', Type: 'Whole Wheat' }, tags: ['atta','flour','cooking'], useCases: ['chapati','baking'], description: '100% whole wheat atta.', perishable: true },
  { sku: 'GRC-005', name: 'MDH Garam Masala 100g', category: 'Groceries', subcategory: 'spices', brand: 'MDH', price: 85, originalPrice: 95, rating: 4.4, reviewCount: 2400, specifications: { Weight: '100g' }, tags: ['masala','spices','cooking'], useCases: ['cooking'], description: 'Classic Indian masala.', perishable: true },
  { sku: 'GRC-006', name: 'Nestle Maggi 2-Minute Noodles (12-pack)', category: 'Groceries', subcategory: 'instant', brand: 'Nestle', price: 155, originalPrice: 180, rating: 4.3, reviewCount: 6800, specifications: { Pack: '12 x 70g' }, tags: ['noodles','snack'], useCases: ['snack','quick meal'], description: 'Convenient 12-pack of noodles.', perishable: true },
  { sku: 'GRC-007', name: 'Lays Classic Salted 90g', category: 'Groceries', subcategory: 'snack', brand: 'Lays', price: 45, originalPrice: 50, rating: 4.2, reviewCount: 3100, specifications: { Weight: '90g' }, tags: ['chips','snack'], useCases: ['snack'], description: 'Classic salted potato chips.', perishable: true },
  { sku: 'GRC-008', name: 'Red Label Tea 500g', category: 'Groceries', subcategory: 'beverage', brand: 'Brooke Bond', price: 275, originalPrice: 320, rating: 4.4, reviewCount: 4200, specifications: { Weight: '500g' }, tags: ['tea','beverage'], useCases: ['daily use'], description: 'Rich-tasting black tea.', perishable: true },
];

const CATEGORY_WAREHOUSES = [
  { code: 'DEL', name: 'Delhi Warehouse', city: 'Delhi', state: 'DL', region: 'North' },
  { code: 'BOM', name: 'Mumbai Warehouse', city: 'Mumbai', state: 'MH', region: 'West' },
  { code: 'BLR', name: 'Bengaluru Warehouse', city: 'Bengaluru', state: 'KA', region: 'South' },
];

const POLICIES = [
  {
    title: 'ShopSmart Return Policy',
    docType: 'return',
    version: '2.1',
    region: 'IN',
    text: `# ShopSmart Return Policy

## Overview
This return policy applies to orders placed on ShopSmart AI. Terms vary by product category.

## Return Window
Most products are eligible for return within 7 days of delivery. Specific categories have different windows:

- Electronics (laptops, phones, cameras): 7 days from delivery, provided the product is unopened or defective on arrival.
- Fashion and footwear: 14 days from delivery, provided tags are intact and the product is unused.
- Books: 7 days from delivery for defective or wrong items only.
- Groceries and perishables: Non-returnable except for damaged or expired items reported within 24 hours of delivery.
- Home appliances: 10 days from delivery for installation issues or defects.

## Opened Products
Opened electronics may be returned only if they are defective (dead on arrival or non-functional). Shoppers should contact support within 48 hours of delivery and provide a short description or video of the defect.

Opened laptops specifically require the serial number and a brief description of the issue; cosmetic damage from use is not covered under return.

## Condition Requirements
All returns must include original packaging, accessories, invoices and tags. Returns that do not meet these conditions may be rejected or partially refunded at the warehouse's discretion.

## Non-returnable Items
The following items are not eligible for return:
- Software downloads and digital codes
- Personalised or made-to-order products
- Perishables after 24 hours
- Innerwear and swimwear

## How to Request a Return
Open the order from your order history, click "Return item", choose a reason, and submit. Pickup is scheduled within 2 business days.
`,
  },
  {
    title: 'ShopSmart Refund Policy',
    docType: 'refund',
    version: '1.4',
    region: 'IN',
    text: `# ShopSmart Refund Policy

## Overview
Refunds are issued after the returned item passes a quality check at the receiving warehouse.

## Refund Timeline
- Credit / debit card: 5-7 business days after quality check.
- UPI: 2-3 business days after quality check.
- Net banking: 3-5 business days.
- ShopSmart Wallet: Instant on approval.

## Partial Refunds
A partial refund may be issued when:
- Original packaging is missing but the product is intact (up to 10% deduction).
- Minor cosmetic damage not noted in the return reason (up to 15% deduction).

## Refund for Cancellations
Orders cancelled before shipping are fully refunded within 24 hours. Orders cancelled after shipping follow the standard return → refund flow.

## Failed Delivery
If a shipment is undeliverable and returned to the warehouse, a full refund is issued within 7 business days of receipt.

## Exceptions
Refunds for perishable goods are credited to ShopSmart Wallet only.
`,
  },
  {
    title: 'ShopSmart Shipping Policy',
    docType: 'shipping',
    version: '1.2',
    region: 'IN',
    text: `# ShopSmart Shipping Policy

## Delivery Timelines
- Metro cities: 1-3 business days
- Tier-2 cities: 3-5 business days
- Remote pincodes: 5-9 business days

## Shipping Charges
- Orders of ₹999 and above ship free across India.
- Orders below ₹999 incur a flat ₹49 shipping fee.
- Express delivery (where available) carries a ₹99 surcharge.

## Order Tracking
Each shipped order generates a tracking number visible under Order details. Updates refresh every few hours; delays are flagged automatically.

## Delivery Attempts
Our logistics partner makes up to 3 delivery attempts. After the third failed attempt the order is returned to origin and refunded under the return policy.

## Address Changes
Shipping addresses can be edited until the order status is "Packed". Afterwards the order must be cancelled and re-placed.

## International Shipping
ShopSmart currently ships only within India.
`,
  },
  {
    title: 'ShopSmart Warranty Policy',
    docType: 'warranty',
    version: '1.0',
    region: 'IN',
    text: `# ShopSmart Warranty Policy

## Manufacturer Warranty
Most electronics ship with a manufacturer warranty. Terms are set by the brand and included in-box.

- Laptops: 1 year standard, with optional 2-year extended warranty at checkout.
- Phones: 1 year standard; batteries covered for 6 months.
- Large appliances: 1 year standard; compressors and motors often 10 years (brand-specific).

## How to Claim
Claims are initiated through the brand's service centre using the ShopSmart invoice as proof of purchase. Shoppers can use "Need help with warranty?" on the order page to generate a service request.

## What's Covered
Manufacturing defects, functional failures under normal usage, and parts that fail within the warranty period.

## What's Not Covered
- Physical damage, liquid damage, or burn marks
- Unauthorised repair or modification
- Normal wear and tear
- Consumables (batteries beyond 6 months unless the brand says otherwise)

## Extended Warranty
Extended warranty must be purchased at checkout. It cannot be added after the order is placed.
`,
  },
];

async function clearAll() {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Warehouse.deleteMany({}),
    Inventory.deleteMany({}),
    InventoryBatch.deleteMany({}),
    HistoricalSales.deleteMany({}),
    Promotion.deleteMany({}),
    Order.deleteMany({}),
    PolicyDocument.deleteMany({}),
    PolicyChunk.deleteMany({}),
  ]);
}

async function seedUsers() {
  const [adminHash, userHash] = await Promise.all([
    User.hashPassword('admin1234'),
    User.hashPassword('demo1234'),
  ]);
  const [admin, demo] = await User.create([
    { email: 'admin@shopsmart.ai', name: 'Admin User', role: 'admin', passwordHash: adminHash },
    { email: 'demo@shopsmart.ai', name: 'Demo Shopper', role: 'user', passwordHash: userHash, preferences: { budgetDefault: 50000, favouriteCategories: ['Electronics', 'Books'] } },
  ]);
  return { admin, demo };
}

async function seedProducts() {
  const docs = PRODUCTS.map((p) => ({ ...p, image: IMG(p.sku), available: true }));
  // ensure >= 50 products: pad with sensible variants if needed
  while (docs.length < 55) {
    const base = docs[docs.length % PRODUCTS.length];
    docs.push({
      ...base,
      sku: `${base.sku}-V${docs.length}`,
      name: `${base.name} (Variant ${docs.length})`,
      price: Math.round(base.price * (0.9 + Math.random() * 0.3)),
      rating: Math.max(3.5, Math.min(4.9, base.rating + (Math.random() - 0.5) * 0.4)),
      reviewCount: Math.round(base.reviewCount * (0.5 + Math.random())),
      image: IMG(`${base.sku}-v${docs.length}`),
    });
  }
  return Product.insertMany(docs);
}

async function seedWarehouses() {
  return Warehouse.insertMany(CATEGORY_WAREHOUSES);
}

async function seedInventory(products, warehouses) {
  const invDocs = [];
  const batchDocs = [];
  const now = Date.now();
  for (const product of products) {
    for (const warehouse of warehouses) {
      const seed = (product.sku + warehouse.code).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const rand = (n) => ((seed * (n + 1)) % 100) / 100;
      let onHand = Math.round(10 + rand(1) * 90);
      if (rand(2) < 0.12) onHand = Math.round(rand(3) * 8); // some low stock
      if (rand(4) < 0.05) onHand = 0;
      invDocs.push({
        product: product._id,
        warehouse: warehouse._id,
        onHand,
        reserved: Math.min(onHand, Math.round(rand(5) * 3)),
        unavailable: 0,
        reorderPoint: 10,
        targetStockLevel: 50,
      });

      if (product.perishable && onHand > 0) {
        const daysToExpiry = rand(6) < 0.3 ? 5 : rand(7) < 0.5 ? 20 : 90;
        batchDocs.push({
          product: product._id,
          warehouse: warehouse._id,
          batchCode: `${product.sku}-B${Math.round(rand(8) * 999)}`,
          quantity: onHand,
          manufacturedOn: new Date(now - 30 * 86400000),
          expiresOn: new Date(now + daysToExpiry * 86400000),
          status: daysToExpiry > 0 ? 'active' : 'expired',
        });
      }
    }
  }
  await Inventory.insertMany(invDocs);
  if (batchDocs.length) await InventoryBatch.insertMany(batchDocs);
}

async function seedHistoricalSales(products) {
  const docs = [];
  const now = Date.now();
  for (const product of products) {
    const base = 1 + ((product.sku.charCodeAt(0) + product.sku.length) % 6);
    for (let d = 1; d <= 30; d++) {
      const date = new Date(now - d * 86400000);
      date.setHours(0, 0, 0, 0);
      const weekend = date.getDay() === 0 || date.getDay() === 6 ? 1.4 : 1;
      const units = Math.max(0, Math.round(base * weekend + (Math.random() - 0.5) * 3));
      docs.push({ product: product._id, date, unitsSold: units });
    }
  }
  await HistoricalSales.insertMany(docs);
}

async function seedPromotions() {
  const now = Date.now();
  await Promotion.insertMany([
    {
      code: 'WELCOME100',
      description: 'Flat ₹100 off on first order of ₹999+',
      discountType: 'fixed',
      discountValue: 100,
      minOrderValue: 999,
      endsAt: new Date(now + 90 * 86400000),
    },
    {
      code: 'SAVE10',
      description: '10% off up to ₹500 on orders ₹2000+',
      discountType: 'percent',
      discountValue: 10,
      maxDiscount: 500,
      minOrderValue: 2000,
      endsAt: new Date(now + 60 * 86400000),
    },
    {
      code: 'FESTIVE20',
      description: '20% off up to ₹1500 on orders ₹5000+',
      discountType: 'percent',
      discountValue: 20,
      maxDiscount: 1500,
      minOrderValue: 5000,
      endsAt: new Date(now + 30 * 86400000),
    },
  ]);
}

async function seedPolicies() {
  for (const policy of POLICIES) {
    await ingestDocument({
      title: policy.title,
      docType: policy.docType,
      version: policy.version,
      region: policy.region,
      sourceFileName: `${policy.docType}-policy-${policy.version}.md`,
      text: policy.text,
    });
  }
}

async function seedSampleOrders(products, warehouses, user) {
  const laptop = products.find((p) => p.sku === 'LTP-002') || products[0];
  const book = products.find((p) => p.sku === 'BK-001') || products[1];
  await Order.create([
    {
      orderNumber: `OSA-${(Date.now() - 2 * 86400000).toString(36).toUpperCase()}`,
      user: user._id,
      items: [
        {
          product: laptop._id,
          nameSnapshot: laptop.name,
          skuSnapshot: laptop.sku,
          priceSnapshot: laptop.price,
          quantity: 1,
          warehouse: warehouses[0]._id,
        },
      ],
      subtotal: laptop.price,
      discount: 0,
      shipping: 0,
      total: laptop.price,
      status: 'delivered',
      shippingAddress: { name: 'Demo Shopper', line1: '12 MG Road', city: 'Delhi', state: 'DL', pincode: '110001', phone: '9876543210' },
    },
    {
      orderNumber: `OSA-${(Date.now() - 86400000).toString(36).toUpperCase()}`,
      user: user._id,
      items: [
        {
          product: book._id,
          nameSnapshot: book.name,
          skuSnapshot: book.sku,
          priceSnapshot: book.price,
          quantity: 2,
          warehouse: warehouses[1]._id,
        },
      ],
      subtotal: book.price * 2,
      discount: 0,
      shipping: 49,
      total: book.price * 2 + 49,
      status: 'fulfilment_exception',
      exceptionReason: 'Insufficient inventory at designated warehouse during allocation.',
      shippingAddress: { name: 'Demo Shopper', line1: '12 MG Road', city: 'Delhi', state: 'DL', pincode: '110001', phone: '9876543210' },
    },
  ]);
}

async function run() {
  await connectDB();
  console.log('[seed] Clearing collections…');
  await clearAll();

  console.log('[seed] Users…');
  const { demo } = await seedUsers();

  console.log('[seed] Products…');
  const products = await seedProducts();

  console.log('[seed] Warehouses…');
  const warehouses = await seedWarehouses();

  console.log('[seed] Inventory + batches…');
  await seedInventory(products, warehouses);

  console.log('[seed] Historical sales (30 days)…');
  await seedHistoricalSales(products);

  console.log('[seed] Promotions…');
  await seedPromotions();

  console.log('[seed] Sample orders…');
  await seedSampleOrders(products, warehouses, demo);

  console.log('[seed] Policies (chunk + embed)… this may take ~30s if Gemini key is set');
  await seedPolicies();

  console.log('[seed] Done.');
  console.log('[seed] Demo credentials:');
  console.log('       Admin:    admin@shopsmart.ai / admin1234');
  console.log('       Customer: demo@shopsmart.ai  / demo1234');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
