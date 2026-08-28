# UniUni Shipping & Logistics Hub

A production-ready logistics management dashboard and developer console for **UniUni Logistics** (Canada & US Last-Mile Delivery).

This platform provides end-to-end capabilities for e-commerce merchants, 3PL warehouses, and software engineers integrating with UniUni's logistics infrastructure.

---

## 🚀 Key Features

### 1. 📦 Parcel Tracking & Live Proof of Delivery (POD)
- Real-time parcel status lookup by Tracking Number or Order Reference.
- Visual scan event timeline across origin gateways, conveyor sorting hubs, and delivery vans.
- High-resolution Proof of Delivery (POD) photo inspections with delivery timestamp and recipient notes.
- Integrated Courier Simulator to test status transitions from Intake to Delivered.

### 2. 🏷️ Shipments & 4x6 Label Generation
- Create domestic (Canada / US) and cross-border shipments with full customs declaration & HS codes.
- Instant 4x6 thermal shipping label generator with scannable Code128 barcodes and routing blocks.
- One-click print dialog and batch label selection.
- Single or bulk shipment cancellation and status lifecycle management.

### 3. 🗺️ Sort Codes & Conveyor Routing Engine
- Automated postal code parsing for all Canadian provinces (A-Z) and US ZIP codes.
- Accurate airport gateway resolution (YYZ, YVR, YUL, YYC, YEG, YOW, LAX, ORD, DFW, JFK, etc.).
- Area zones (A, B, C, R) and conveyor bin classification.

### 4. 💰 Real-Time Rate Quoting & Price Estimation
- Dynamic rate calculation based on billable dimensional weight (L × W × H / 5000) vs actual weight.
- Multi-tier service breakdown: Standard Ground, Priority Express, and Cross-Border Expedited.
- Currency handling in CAD and USD.

### 5. ⚡ Developer API Request Runner & Explorer
- Pre-built interactive requests for every UniUni REST API endpoint:
  - `POST /api/v2/shipments/create`
  - `POST /api/v2/shipments/purchase`
  - `GET /api/v2/shipments/tracking`
  - `POST /api/v2/routing/sort-code`
  - `POST /api/v2/rates/estimate`
  - `POST /api/v2/manifests/create`
- Live payload editor, curl generator, response headers inspection, and latency metrics.

### 6. 📋 Batch Manifests
- Group multiple individual shipments into driver pickup batches.
- Generate and print official master handover manifests with batch barcodes.

### 7. 🔔 Webhook Studio & Event Simulation
- Test incoming delivery webhooks (`tracking.status_updated`, `pod.image_captured`, `exception.delivery_failed`).
- HMAC SHA-256 signature verification generator and real-time event logs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, JsBarcode.
- **Backend / API**: Express.js, Node.js (with full static fallback resilience for Vercel/Netlify).
- **Tooling & Build**: Vite, TypeScript, ESBuild.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/uniuni-shipping-hub.git
cd uniuni-shipping-hub

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🚢 Deployment

### Deploy to Vercel
1. Connect your GitHub repository to Vercel.
2. The included `vercel.json` and `api/index.ts` automatically configure the build output and routing:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**.

### Deploy to Docker / Container / Cloud Run
Build and run the production server:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

---

## 🔐 Configuration & API Credentials

Click **Manage Test Keys** in the application to configure your API environment:
- **Environments**: Global Sandbox (`api-sandbox.ship.uniuni.com`) or Production Gateway (`api.ship.uniuni.com`).
- **Authentication**: Bearer Token / Client ID & Secret.
- **Offline Simulation Mode**: Automatically fall back to realistic sandbox data when testing without network access.

---

## 📄 License

MIT License - feel free to customize and use this software for your shipping workflows.
