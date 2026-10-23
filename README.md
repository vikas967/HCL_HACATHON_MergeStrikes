🛍️ ShopSmart AI

Autonomous E-Commerce Assistant Platform built for the HCL Hackathon by Team MergeStrikes.

ShopSmart AI is a next-generation e-commerce platform that integrates multi-agent AI to solve discovery overload, operational inefficiencies, and policy confusion. It uses a tiered AI system powered by Google Gemini and LangChain to provide a conversational, highly personalized shopping experience.

✨ Key Features

🛒 Customer-Facing Features

Conversational Discovery (English & Hinglish): Talk to the AI to find products based on budget and specs (e.g., "Saste laptops dikhao under ₹50,000").

Tiered AI Agents:

Basic Tier: Simple database queries and availability checks.

Premium Tier: Multi-agent orchestration offering personalized recommendations, body-type matching, and smart bundle discounts.

AI Checkout Assistant: Automatically checks budget constraints and suggests cheaper alternatives if the cart goes over budget.

RAG-Powered Support Assistant: Grounded, order-specific policy resolution (refunds, returns, warranties) using vector search.

Real-time Order Tracking: Ask the AI for live delivery updates.

⚙️ Operational & Admin Features (Automated)

Smart Sustainability (Expiry Engine): Automated cron jobs track near-expiry food items and apply massive discounts automatically.

Geospatial Cold Storage Alerts: Uses MongoDB $geoNear to find NGOs or cold storages within a 3km radius for unsold near-expiry items and sends automated email alerts via Nodemailer.

Proactive Restock Alerts: Automatically tracks user requests for out-of-stock items and pushes notifications when inventory is replenished.

Role-Based Access Control (RBAC): Secure admin dashboard to manage inventory, forecast stockouts, and handle promotions.

🛠️ Tech Stack

Frontend:

React.js 19 + Vite

Tailwind CSS (Styling)

Redux Toolkit & Context API (State Management)

React Router (RBAC Navigation)

Backend:

Node.js & Express.js

MongoDB Atlas (Database & $geoNear spatial queries)

Mongoose (Schema Modeling)

Node-Cron (Task Scheduling) & Nodemailer (Email Alerts)

AI & Orchestration:

Google Gemini API (Core LLM)

LangChain (Agent Orchestration & Router)

Vector Search (for RAG Support Agent)

📁 Project Structure

shopsmart-ai/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, ProductCard, ChatInterface)
│   │   ├── context/            # Auth, Cart, and Toast Contexts
│   │   ├── layouts/            # AdminLayout & CustomerLayout (RBAC)
│   │   ├── pages/              # Catalog, Checkout, AIAssistant, PolicyAssistant
│   │   │   └── admin/          # Admin Dashboard Pages (Inventory, Expiry, Ops)
│   │   └── services/           # Axios API services
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Node/Express Backend
    ├── scripts/                # Database seeding scripts
    ├── src/
    │   ├── ai/                 # Gemini integration, LangChain Agents, Prompts
    │   ├── config/             # DB & Environment configs
    │   ├── controllers/        # Business logic for auth, products, cart, admin
    │   ├── inventory/          # Expiry and Forecast background services
    │   ├── middleware/         # JWT Auth & Error handling
    │   ├── models/             # Mongoose schemas (User, Product, Order, etc.)
    │   ├── orders/             # Order fulfillment logic
    │   ├── rag/                # Document chunking & Vector retrieval
    │   ├── routes/             # Express API routes
    │   └── utils/              # Schedulers (node-cron tasks)
    ├── package.json
    └── server.js               # Entry point


🚀 Installation & Setup

Prerequisites

Node.js (v18 or higher)

MongoDB Atlas Account / Local MongoDB

Google Gemini API Key

1. Clone the Repository

git clone https://github.com/vikas967/HCL_HACATHON_MergeStrikes.git
cd HCL_HACATHON_MergeStrikes


2. Backend Setup

cd server
npm install


Create a .env file in the server directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_app_password


Run the backend:

npm run dev


3. Frontend Setup

cd ../client
npm install


Create a .env file in the client directory:

VITE_API_BASE_URL=http://localhost:5000/api


Run the frontend:

npm run dev


👥 Team: MergeStrikes

Vikas (23/SE/171)

Shorya (23/SE/147)

Ukesh Kumar Gautam (23/SE/164)

Built for the ShopSmart AI Hackathon challenge.
