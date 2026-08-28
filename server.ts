import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory data store for shipments, batches, webhook logs, and configurations
interface StoredShipment {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  status: string;
  serviceType: string;
  sender: any;
  recipient: any;
  package: any;
  shipmentLineItems: any[];
  sortCode: string;
  destinationAirport: string;
  sortingZone: string;
  rate: number;
  currency: string;
  createdAt: string;
  purchasedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  labelUrl?: string;
  batchId?: string;
  scanEvents: any[];
  proofOfDelivery?: any;
}

const initialShipments: StoredShipment[] = [
  {
    id: 'shp_uni_903841920',
    orderNumber: 'ORD-2026-8941',
    trackingNumber: 'UNI904817294819203',
    status: 'OUT_FOR_DELIVERY',
    serviceType: 'UNI_STANDARD',
    sender: {
      name: 'Apex Warehouse Logistics',
      company: 'Apex Supply Co.',
      phone: '+1 905-555-0188',
      addressLine1: '6850 Invader Crescent',
      city: 'Mississauga',
      stateOrProvince: 'ON',
      postalCode: 'L5T 2B7',
      countryCode: 'CA',
    },
    recipient: {
      name: 'Sarah Chen',
      company: 'Apex Design Studio',
      phone: '+1 416-555-0199',
      email: 'sarah.chen@example.ca',
      addressLine1: '250 Front St W',
      addressLine2: 'Suite 400',
      city: 'Toronto',
      stateOrProvince: 'ON',
      postalCode: 'M5V 2X4',
      countryCode: 'CA',
      buzzCode: '400',
      deliveryInstructions: 'Leave with front reception desk.',
    },
    package: {
      weight: 1.25,
      weightUnit: 'kg',
      dimensions: { length: 28, width: 19, height: 8, unit: 'cm' },
      signatureRequired: false,
    },
    shipmentLineItems: [
      {
        sku: 'APX-TECH-01',
        description: 'Wireless Noise-Cancelling Headphones',
        quantity: 1,
        unitPrice: 129.99,
        currency: 'CAD',
        hsCode: '8518.30.2000',
        countryOfOrigin: 'CA',
      },
    ],
    sortCode: 'YYZ-A 021',
    destinationAirport: 'YYZ',
    sortingZone: 'A',
    rate: 5.85,
    currency: 'CAD',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    purchasedAt: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
    scanEvents: [
      {
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'OUT_FOR_DELIVERY',
        statusText: 'Out for delivery with UniUni Driver #314',
        location: 'Toronto Central Delivery Station',
        facilityCode: 'YYZ-D01',
      },
      {
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        status: 'IN_TRANSIT',
        statusText: 'Sorted and dispatched to regional delivery hub',
        location: 'YYZ Main Sorting Hub (Mississauga, ON)',
        facilityCode: 'YYZ-HUB',
      },
      {
        timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        status: 'RECEIVED_AT_FACILITY',
        statusText: 'Electronic manifest created & parcel arrived at origin gateway',
        location: 'Mississauga Gateway',
        facilityCode: 'YYZ-GW',
      },
    ],
  },
  {
    id: 'shp_uni_903841921',
    orderNumber: 'ORD-2026-9022',
    trackingNumber: 'UNI904817294819204',
    status: 'DELIVERED',
    serviceType: 'UNI_PRIORITY',
    sender: {
      name: 'West Coast Direct',
      company: 'Pacific Retailers',
      phone: '+1 604-555-0144',
      addressLine1: '3880 Jacombs Rd',
      city: 'Richmond',
      stateOrProvince: 'BC',
      postalCode: 'V6V 1Y6',
      countryCode: 'CA',
    },
    recipient: {
      name: 'Marcus Vance',
      phone: '+1 604-555-0122',
      email: 'm.vance@example.ca',
      addressLine1: '1055 W Georgia St',
      city: 'Vancouver',
      stateOrProvince: 'BC',
      postalCode: 'V6E 3P3',
      countryCode: 'CA',
      deliveryInstructions: 'Porch drop-off is okay.',
    },
    package: {
      weight: 0.85,
      weightUnit: 'kg',
      dimensions: { length: 22, width: 15, height: 6, unit: 'cm' },
      signatureRequired: false,
    },
    shipmentLineItems: [
      {
        sku: 'PAC-CLOTH-88',
        description: 'Merino Wool Beanie & Gloves Set',
        quantity: 1,
        unitPrice: 48.0,
        currency: 'CAD',
      },
    ],
    sortCode: 'YVR-A 104',
    destinationAirport: 'YVR',
    sortingZone: 'A',
    rate: 6.95,
    currency: 'CAD',
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    purchasedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    scanEvents: [
      {
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        status: 'DELIVERED',
        statusText: 'Delivered at front door / secure vestibule. Photo captured.',
        location: 'Vancouver, BC',
        facilityCode: 'YVR-D02',
      },
      {
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        status: 'OUT_FOR_DELIVERY',
        statusText: 'Out for delivery with UniUni Express Courier',
        location: 'Vancouver Richmond Station',
      },
    ],
    proofOfDelivery: {
      deliveredAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      recipientName: 'M. Vance (Front Porch)',
      locationDescription: 'Front Door Porch - Protected from weather',
      photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'shp_uni_903841922',
    orderNumber: 'ORD-2026-9140',
    trackingNumber: 'UUS804918294819205',
    status: 'IN_TRANSIT',
    serviceType: 'UNI_CROSSBORDER_EXPEDITE',
    sender: {
      name: 'Global Crossborder Fulfilment',
      company: 'Universal Goods Inc',
      phone: '+1 310-555-0177',
      addressLine1: '2100 E 49th St',
      city: 'Vernon',
      stateOrProvince: 'CA',
      postalCode: '90058',
      countryCode: 'US',
    },
    recipient: {
      name: 'Emily Watson',
      phone: '+1 212-555-0163',
      email: 'emily.w@example.com',
      addressLine1: '350 5th Ave',
      addressLine2: 'Apt 18B',
      city: 'New York',
      stateOrProvince: 'NY',
      postalCode: '10118',
      countryCode: 'US',
    },
    package: {
      weight: 2.1,
      weightUnit: 'lb',
      dimensions: { length: 12, width: 9, height: 4, unit: 'in' },
      signatureRequired: true,
      insuranceValue: 150,
    },
    shipmentLineItems: [
      {
        sku: 'GLB-ART-44',
        description: 'Handcrafted Ceramic Planter',
        quantity: 2,
        unitPrice: 42.5,
        currency: 'USD',
        hsCode: '6912.00.4100',
        countryOfOrigin: 'US',
      },
    ],
    sortCode: 'JFK-A 101',
    destinationAirport: 'JFK',
    sortingZone: 'A',
    rate: 11.2,
    currency: 'USD',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    purchasedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    scanEvents: [
      {
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        status: 'IN_TRANSIT',
        statusText: 'Departed Cross-Dock sorting hub en route to JFK Regional Gateway',
        location: 'LAX Air Cargo Cross-Dock',
      },
      {
        timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        status: 'RECEIVED_AT_FACILITY',
        statusText: 'Package scanned at origin induction terminal',
        location: 'Vernon CA Facility',
      },
    ],
  },
];

let databaseShipments = [...initialShipments];
let databaseBatches: any[] = [];
let databaseWebhookLogs: any[] = [];

// Helper to determine sort code
function computeSortCode(postal: string, country: string = 'CA') {
  const clean = (postal || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (country === 'US') {
    const zip2 = clean.slice(0, 2);
    if (zip2 === '90' || zip2 === '91') return { port: 'LAX', area: 'A', route: '310', full: 'LAX-A 310', airport: 'LAX', zone: 'A' };
    if (zip2 === '94' || zip2 === '95') return { port: 'SFO', area: 'A', route: '340', full: 'SFO-A 340', airport: 'SFO', zone: 'A' };
    if (zip2 === '98') return { port: 'SEA', area: 'A', route: '380', full: 'SEA-A 380', airport: 'SEA', zone: 'A' };
    if (zip2 === '10' || zip2 === '11') return { port: 'JFK', area: 'A', route: '101', full: 'JFK-A 101', airport: 'JFK', zone: 'A' };
    if (zip2 === '07' || zip2 === '08') return { port: 'EWR', area: 'A', route: '070', full: 'EWR-A 070', airport: 'EWR', zone: 'A' };
    if (zip2 === '60') return { port: 'ORD', area: 'A', route: '601', full: 'ORD-A 601', airport: 'ORD', zone: 'A' };
    if (zip2 === '75') return { port: 'DFW', area: 'A', route: '750', full: 'DFW-A 750', airport: 'DFW', zone: 'A' };
    return { port: 'LAX', area: 'B', route: '399', full: 'LAX-B 399', airport: 'LAX', zone: 'B' };
  } else {
    const fsa1 = clean.slice(0, 1);
    if (fsa1 === 'M') return { port: 'YYZ', area: 'A', route: '021', full: 'YYZ-A 021', airport: 'YYZ', zone: 'A' };
    if (fsa1 === 'L') return { port: 'YYZ', area: 'B', route: '045', full: 'YYZ-B 045', airport: 'YYZ', zone: 'B' };
    if (fsa1 === 'V') return { port: 'YVR', area: 'A', route: '104', full: 'YVR-A 104', airport: 'YVR', zone: 'A' };
    if (fsa1 === 'H') return { port: 'YUL', area: 'A', route: '033', full: 'YUL-A 033', airport: 'YUL', zone: 'A' };
    if (fsa1 === 'T') return { port: 'YYC', area: 'A', route: '062', full: 'YYC-A 062', airport: 'YYC', zone: 'A' };
    if (fsa1 === 'K') return { port: 'YOW', area: 'A', route: '012', full: 'YOW-A 012', airport: 'YOW', zone: 'A' };
    return { port: 'YYZ', area: 'C', route: '088', full: 'YYZ-C 088', airport: 'YYZ', zone: 'C' };
  }
}

// 1. API: List all shipments
app.get('/api/uniuni/shipments', (req: Request, res: Response) => {
  const { status, search } = req.query;
  let results = [...databaseShipments];

  if (status && status !== 'ALL') {
    results = results.filter((s) => s.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        s.orderNumber.toLowerCase().includes(q) ||
        s.trackingNumber.toLowerCase().includes(q) ||
        s.recipient.name.toLowerCase().includes(q) ||
        s.recipient.postalCode.toLowerCase().includes(q) ||
        s.sortCode.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: results.length,
    shipments: results,
  });
});

// 2. API: Create draft shipment
app.post('/api/uniuni/shipments', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.recipient || !payload.recipient.name || !payload.recipient.postalCode) {
      return res.status(400).json({ success: false, message: 'Recipient name and postal code are required' });
    }

    const country = payload.recipient.countryCode || 'CA';
    const sorting = computeSortCode(payload.recipient.postalCode, country);
    const trackingPrefix = country === 'US' ? 'UUS' : 'UNI';
    const trackingNumber = `${trackingPrefix}${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
    const shipmentId = `shp_uni_${Date.now()}`;

    const newShipment: StoredShipment = {
      id: shipmentId,
      orderNumber: payload.orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
      trackingNumber,
      status: 'DRAFT',
      serviceType: payload.serviceType || 'UNI_STANDARD',
      sender: payload.sender || {
        name: 'Warehouse Shipper',
        company: 'FastLogistics Inc',
        phone: '+1 800-555-0100',
        addressLine1: '100 Distribution Way',
        city: 'Mississauga',
        stateOrProvince: 'ON',
        postalCode: 'L5T 1B2',
        countryCode: 'CA',
      },
      recipient: payload.recipient,
      package: payload.package || {
        weight: 1.0,
        weightUnit: 'kg',
        dimensions: { length: 20, width: 15, height: 10, unit: 'cm' },
      },
      shipmentLineItems: payload.shipmentLineItems || [
        {
          sku: 'ITEM-001',
          description: 'Standard Merchandise Goods',
          quantity: 1,
          unitPrice: 25.0,
          currency: country === 'US' ? 'USD' : 'CAD',
        },
      ],
      sortCode: sorting.full,
      destinationAirport: sorting.airport,
      sortingZone: sorting.zone,
      rate: Number(payload.rate || 5.85),
      currency: country === 'US' ? 'USD' : 'CAD',
      createdAt: new Date().toISOString(),
      scanEvents: [
        {
          timestamp: new Date().toISOString(),
          status: 'DRAFT',
          statusText: 'Shipment created in DRAFT status. Pending purchase & label generation.',
          location: 'Client API Portal',
        },
      ],
    };

    databaseShipments.unshift(newShipment);

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully in DRAFT status',
      shipment: newShipment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
});

// 3. API: Purchase shipment
app.post('/api/uniuni/shipments/:id/purchase', (req: Request, res: Response) => {
  const { id } = req.params;
  const shipment = databaseShipments.find((s) => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }

  shipment.status = 'PURCHASED';
  shipment.purchasedAt = new Date().toISOString();
  shipment.labelUrl = `/api/uniuni/shipments/${shipment.id}/label.pdf`;
  shipment.scanEvents.unshift({
    timestamp: new Date().toISOString(),
    status: 'PURCHASED',
    statusText: 'Shipping label purchased and activated. Ready for driver pickup induction.',
    location: 'UniUni Processing Gateway',
  });

  res.json({
    success: true,
    message: 'Shipment purchased successfully. Label generated.',
    shipment,
  });
});

// 4. API: Cancel/Refund shipment
app.post('/api/uniuni/shipments/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const shipment = databaseShipments.find((s) => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }

  const previousStatus = shipment.status;
  shipment.status = previousStatus === 'PURCHASED' ? 'REFUNDED' : 'CANCELLED';
  shipment.scanEvents.unshift({
    timestamp: new Date().toISOString(),
    status: shipment.status,
    statusText: `Shipment marked as ${shipment.status}. Label voided.`,
    location: 'UniUni API Gateway',
  });

  res.json({
    success: true,
    message: `Shipment ${shipment.status.toLowerCase()} successfully`,
    shipment,
  });
});

// 5. API: Tracking query
app.get('/api/uniuni/tracking/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const shipment = databaseShipments.find((s) => s.trackingNumber === id || s.id === id || s.orderNumber === id);

  if (shipment) {
    return res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        orderNumber: shipment.orderNumber,
        status: shipment.status,
        recipient: {
          name: shipment.recipient.name,
          city: shipment.recipient.city,
          state: shipment.recipient.stateOrProvince,
          postalCode: shipment.recipient.postalCode,
          country: shipment.recipient.countryCode,
        },
        sortCode: shipment.sortCode,
        destinationAirport: shipment.destinationAirport,
        events: shipment.scanEvents,
        proofOfDelivery: shipment.proofOfDelivery,
      },
    });
  }

  // If tracking number not in local database, generate simulated live tracking response
  const country = id.startsWith('UUS') ? 'US' : 'CA';
  const sorting = computeSortCode('M5V 2X4', country);
  return res.json({
    success: true,
    data: {
      trackingNumber: id,
      orderNumber: `ORD-${id.slice(-6)}`,
      status: 'IN_TRANSIT',
      recipient: {
        name: 'UniUni Recipient',
        city: country === 'US' ? 'Los Angeles' : 'Toronto',
        state: country === 'US' ? 'CA' : 'ON',
        postalCode: country === 'US' ? '90012' : 'M5V 2T6',
        country,
      },
      sortCode: sorting.full,
      destinationAirport: sorting.airport,
      events: [
        {
          timestamp: new Date().toISOString(),
          status: 'IN_TRANSIT',
          statusText: 'Processed at UniUni Regional Sort Center',
          location: `${sorting.airport} Sorting Facility`,
        },
        {
          timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          status: 'RECEIVED_AT_FACILITY',
          statusText: 'Parcel Ingested & Weighed',
          location: 'Origin Terminal',
        },
      ],
    },
  });
});

// 6. API: Advance shipment milestone (for testing)
app.post('/api/uniuni/shipments/:id/advance', (req: Request, res: Response) => {
  const { id } = req.params;
  const { nextStatus } = req.body;
  const shipment = databaseShipments.find((s) => s.id === id || s.trackingNumber === id);

  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }

  const validTransitions: Record<string, { status: string; text: string; location: string }> = {
    RECEIVED_AT_FACILITY: {
      status: 'RECEIVED_AT_FACILITY',
      text: 'Inducted and scanned at origin gateway sorting belt',
      location: `${shipment.sender.city} Gateway Hub`,
    },
    IN_TRANSIT: {
      status: 'IN_TRANSIT',
      text: 'Line-haul container departed for destination airport sorting facility',
      location: `${shipment.destinationAirport} Sorting Facility`,
    },
    OUT_FOR_DELIVERY: {
      status: 'OUT_FOR_DELIVERY',
      text: 'Loaded on delivery van. Courier is en route to recipient address.',
      location: `${shipment.recipient.city} Local Delivery Hub`,
    },
    DELIVERED: {
      status: 'DELIVERED',
      text: 'Delivered to front door / mailroom. Photo proof captured.',
      location: `${shipment.recipient.city}, ${shipment.recipient.stateOrProvince}`,
    },
  };

  const target = validTransitions[nextStatus] || {
    status: nextStatus || 'IN_TRANSIT',
    text: `Status updated to ${nextStatus}`,
    location: `${shipment.destinationAirport} Hub`,
  };

  shipment.status = target.status;
  if (target.status === 'DELIVERED') {
    shipment.deliveredAt = new Date().toISOString();
    shipment.proofOfDelivery = {
      deliveredAt: shipment.deliveredAt,
      recipientName: `${shipment.recipient.name} (Porch Dropoff)`,
      locationDescription: 'Front porch beside main entrance',
      photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    };
  }

  shipment.scanEvents.unshift({
    timestamp: new Date().toISOString(),
    status: target.status,
    statusText: target.text,
    location: target.location,
  });

  res.json({
    success: true,
    message: `Milestone advanced to ${target.status}`,
    shipment,
  });
});

// 7. API: Batches and Manifests
app.get('/api/uniuni/batches', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: databaseBatches.length,
    batches: databaseBatches,
  });
});

app.post('/api/uniuni/batches', (req: Request, res: Response) => {
  const { shipmentIds, hubCode, driverName } = req.body;
  if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide shipmentIds array' });
  }

  const selected = databaseShipments.filter((s) => shipmentIds.includes(s.id));
  const totalWeight = selected.reduce((acc, s) => acc + (Number(s.package?.weight) || 1), 0);
  const batchId = `bat_uni_${Date.now()}`;
  const batchNumber = `UNI-BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${databaseBatches.length + 101}`;

  const newBatch = {
    id: batchId,
    batchNumber,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    shipmentIds,
    totalShipments: selected.length,
    totalWeightKg: Number(totalWeight.toFixed(2)),
    driverName: driverName || 'Assigned Uni Courier',
    hubCode: hubCode || 'YYZ-01',
    manifestUrl: `/api/uniuni/batches/${batchId}/manifest.pdf`,
  };

  databaseBatches.unshift(newBatch);

  // Link batch to shipments
  selected.forEach((s) => {
    s.batchId = batchId;
  });

  res.status(201).json({
    success: true,
    message: 'Batch manifest created successfully',
    batch: newBatch,
  });
});

// 8. API: Webhook Simulator & Trigger
app.post('/api/uniuni/webhooks/simulate', (req: Request, res: Response) => {
  const { eventType, targetUrl, secretKey, shipmentId } = req.body;
  const shipment = databaseShipments.find((s) => s.id === shipmentId) || databaseShipments[0];

  const payload = {
    event: eventType || 'tracking.status_updated',
    timestamp: new Date().toISOString(),
    data: {
      trackingNumber: shipment?.trackingNumber || 'UNI904817294819203',
      orderNumber: shipment?.orderNumber || 'ORD-2026-8941',
      status: shipment?.status || 'IN_TRANSIT',
      sortCode: shipment?.sortCode || 'YYZ-A 021',
      lastScan: {
        timestamp: new Date().toISOString(),
        location: `${shipment?.destinationAirport || 'YYZ'} Sorting Facility`,
        status: shipment?.status || 'IN_TRANSIT',
      },
    },
  };

  const stringified = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secretKey || 'uni_webhook_secret_default_key')
    .update(stringified)
    .digest('hex');

  const logEntry = {
    id: `wh_log_${Date.now()}`,
    event: eventType || 'tracking.status_updated',
    timestamp: new Date().toISOString(),
    payload,
    targetUrl: targetUrl || 'https://client-merchant.com/api/webhooks/uniuni',
    status: 'SUCCESS' as const,
    httpResponseCode: 200,
    signature: `sha256=${signature}`,
    durationMs: Math.floor(45 + Math.random() * 80),
  };

  databaseWebhookLogs.unshift(logEntry);
  if (databaseWebhookLogs.length > 50) databaseWebhookLogs.pop();

  res.json({
    success: true,
    message: 'Simulated webhook event dispatched successfully',
    log: logEntry,
  });
});

app.get('/api/uniuni/webhooks/logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    logs: databaseWebhookLogs,
  });
});

// 9. API: Universal UniUni Proxy
app.post('/api/uniuni/proxy', async (req: Request, res: Response) => {
  const { url, method, headers, body, mockFallback } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  const startTime = Date.now();
  try {
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers || {}),
    };

    const response = await fetch(url, {
      method: method || 'GET',
      headers: fetchHeaders,
      body: method !== 'GET' && method !== 'HEAD' && body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData: any;
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const duration = Date.now() - startTime;
    return res.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs: duration,
      data: responseData,
      isLiveResponse: true,
    });
  } catch (error: any) {
    // If upstream call fails (e.g. invalid endpoint, sandbox network block, or no token), provide rich simulation
    const duration = Date.now() - startTime;
    return res.json({
      success: true,
      status: 200,
      statusText: 'OK (Sandbox Simulator)',
      durationMs: duration + 42,
      isLiveResponse: false,
      note: 'Simulated response from UniUni Sandbox Engine',
      data: mockFallback || {
        code: 200,
        message: 'Success',
        timestamp: new Date().toISOString(),
        requestEcho: { url, method, body },
      },
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'UniUni Shipping API Tool', time: new Date().toISOString() });
});

// Vite middleware & Production static serving
export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UniUni Shipping API App listening on port ${PORT}`);
  });
}

// If running directly as node process (not imported by Vercel serverless function)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
