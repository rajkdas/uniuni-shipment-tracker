import { Shipment, BatchManifest, WebhookEventRecord, ShipmentStatus } from '../types/uniuni';
import { getUniUniSortCode } from '../utils/uniuniRouting';

const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'shp_uni_903841920',
    orderNumber: 'ORD-2026-9021',
    trackingNumber: 'UNI904817294819203',
    status: 'OUT_FOR_DELIVERY',
    serviceType: 'UNI_STANDARD',
    sender: {
      name: 'Apex Fulfillment Logistics',
      company: 'Apex Supply Co.',
      phone: '+1 416-555-0199',
      addressLine1: '6500 Silver Dart Dr',
      city: 'Mississauga',
      stateOrProvince: 'ON',
      postalCode: 'L5P 1B2',
      countryCode: 'CA',
    },
    recipient: {
      name: 'Sarah Jenkins',
      phone: '+1 416-555-0188',
      email: 'sarah.j@example.ca',
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
        facilityCode: 'YVR-D02',
      },
      {
        timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
        status: 'IN_TRANSIT',
        statusText: 'In transit to Vancouver Regional Hub',
        location: 'Vancouver Gateway',
        facilityCode: 'YVR-GW',
      },
    ],
    proofOfDelivery: {
      deliveredAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      recipientName: 'Marcus Vance',
      locationDescription: 'Front porch beside door planter (Safe drop)',
      photoUrl:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'shp_uni_903841922',
    orderNumber: 'ORD-2026-9023',
    trackingNumber: 'UNI904817294819205',
    status: 'IN_TRANSIT',
    serviceType: 'UNI_STANDARD',
    sender: {
      name: 'St. Laurent Apparels',
      phone: '+1 514-555-0177',
      addressLine1: '400 Rue Sainte-Catherine O',
      city: 'Montreal',
      stateOrProvince: 'QC',
      postalCode: 'H3B 1A6',
      countryCode: 'CA',
    },
    recipient: {
      name: 'David Chen',
      phone: '+1 514-555-0133',
      addressLine1: '3450 Rue Saint-Urbain',
      city: 'Montreal',
      stateOrProvince: 'QC',
      postalCode: 'H2X 2N5',
      countryCode: 'CA',
    },
    package: {
      weight: 2.1,
      weightUnit: 'kg',
      dimensions: { length: 30, width: 22, height: 12, unit: 'cm' },
      signatureRequired: false,
    },
    shipmentLineItems: [
      {
        sku: 'STL-JKT-09',
        description: 'Windbreaker Rain Jacket',
        quantity: 1,
        unitPrice: 79.99,
        currency: 'CAD',
      },
    ],
    sortCode: 'YUL-A 033',
    destinationAirport: 'YUL',
    sortingZone: 'A',
    rate: 5.85,
    currency: 'CAD',
    createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    purchasedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    scanEvents: [
      {
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        status: 'IN_TRANSIT',
        statusText: 'Processed through conveyor sorting system at Montreal YUL',
        location: 'Montreal Saint-Laurent Facility',
        facilityCode: 'YUL-01',
      },
      {
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        status: 'RECEIVED_AT_FACILITY',
        statusText: 'Package received at intake dock',
        location: 'Montreal Gateway',
        facilityCode: 'YUL-GW',
      },
    ],
  },
  {
    id: 'shp_uni_903841923',
    orderNumber: 'ORD-2026-9024',
    trackingNumber: 'UUS804918294819205',
    status: 'IN_TRANSIT',
    serviceType: 'UNI_CROSSBORDER_EXPEDITE',
    sender: {
      name: 'Pacific Cross-Border Gateway',
      phone: '+1 213-555-0100',
      addressLine1: '1900 E 7th St',
      city: 'Los Angeles',
      stateOrProvince: 'CA',
      postalCode: '90021',
      countryCode: 'US',
    },
    recipient: {
      name: 'Jessica Reynolds',
      phone: '+1 213-555-0182',
      addressLine1: '800 W Olympic Blvd',
      city: 'Los Angeles',
      stateOrProvince: 'CA',
      postalCode: '90015',
      countryCode: 'US',
    },
    package: {
      weight: 1.5,
      weightUnit: 'lb',
      dimensions: { length: 12, width: 8, height: 4, unit: 'in' },
      signatureRequired: false,
    },
    shipmentLineItems: [
      {
        sku: 'LAX-GIFT-01',
        description: 'Gourmet Roasted Coffee Beans',
        quantity: 2,
        unitPrice: 18.5,
        currency: 'USD',
      },
    ],
    sortCode: 'LAX-A 310',
    destinationAirport: 'LAX',
    sortingZone: 'A',
    rate: 4.75,
    currency: 'USD',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    purchasedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    scanEvents: [
      {
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        status: 'IN_TRANSIT',
        statusText: 'Sorted at LAX High-Speed Cross-Dock Hub',
        location: 'Los Angeles International Gateway',
        facilityCode: 'LAX-HUB',
      },
    ],
  },
];

const INITIAL_BATCHES: BatchManifest[] = [
  {
    id: 'bat_uni_801',
    batchNumber: 'MNF-2026-08819',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    shipmentIds: ['shp_uni_903841920', 'shp_uni_903841922'],
    totalShipments: 2,
    totalWeightKg: 3.35,
    hubCode: 'YYZ-01 (Toronto Gateway)',
    driverName: 'Assigned Uni Courier #314',
    status: 'DISPATCHED',
  },
];

const INITIAL_WEBHOOK_LOGS: WebhookEventRecord[] = [
  {
    id: 'wh_log_001',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    event: 'tracking.status_updated',
    targetUrl: 'https://merchant-store.com/api/webhooks/uniuni',
    status: 'SUCCESS',
    httpResponseCode: 200,
    signature: 't=1724789123,v1=9e8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    payload: {
      event: 'tracking.status_updated',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      trackingNumber: 'UNI904817294819203',
      orderNumber: 'ORD-2026-9021',
      status: 'OUT_FOR_DELIVERY',
      location: 'Toronto Central Delivery Station',
    },
  },
];

function getStoredShipments(): Shipment[] {
  try {
    const raw = localStorage.getItem('uniuni_shipments_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Local storage parse error:', e);
  }
  localStorage.setItem('uniuni_shipments_db', JSON.stringify(INITIAL_SHIPMENTS));
  return INITIAL_SHIPMENTS;
}

function setStoredShipments(shipments: Shipment[]) {
  try {
    localStorage.setItem('uniuni_shipments_db', JSON.stringify(shipments));
  } catch (e) {
    console.error('Local storage save error:', e);
  }
}

function getStoredBatches(): BatchManifest[] {
  try {
    const raw = localStorage.getItem('uniuni_batches_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Local storage parse error:', e);
  }
  return INITIAL_BATCHES;
}

function setStoredBatches(batches: BatchManifest[]) {
  try {
    localStorage.setItem('uniuni_batches_db', JSON.stringify(batches));
  } catch (e) {
    console.error('Local storage save error:', e);
  }
}

function getStoredWebhookLogs(): WebhookEventRecord[] {
  try {
    const raw = localStorage.getItem('uniuni_webhook_logs_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Local storage parse error:', e);
  }
  return INITIAL_WEBHOOK_LOGS;
}

function setStoredWebhookLogs(logs: WebhookEventRecord[]) {
  try {
    localStorage.setItem('uniuni_webhook_logs_db', JSON.stringify(logs));
  } catch (e) {
    console.error('Local storage save error:', e);
  }
}

/**
 * Safe Fetch Wrapper that parses JSON or gracefully falls back to mock logic
 */
async function safeFetchJson<T>(url: string, options?: RequestInit, fallbackProducer?: () => T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // If the server responded with valid JSON
    if (res.ok && contentType.includes('application/json')) {
      const parsed = await res.json();
      return parsed;
    }

    // If server responded with HTML (e.g. index.html SPA rewrite on Vercel/Netlify), fallback
    if (fallbackProducer) {
      return fallbackProducer();
    }

    // Attempt parsing if status is ok
    if (res.ok) {
      const text = await res.text();
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        return JSON.parse(text);
      }
    }

    if (fallbackProducer) {
      return fallbackProducer();
    }

    throw new Error(`Invalid server response (Status: ${res.status})`);
  } catch (err) {
    if (fallbackProducer) {
      return fallbackProducer();
    }
    throw err;
  }
}

export const UniUniApiClient = {
  /**
   * Fetch all shipments
   */
  async getShipments(): Promise<{ success: boolean; shipments: Shipment[] }> {
    return safeFetchJson<{ success: boolean; shipments: Shipment[] }>(
      '/api/uniuni/shipments',
      undefined,
      () => ({
        success: true,
        shipments: getStoredShipments(),
      })
    );
  },

  /**
   * Fetch tracking details for a tracking number or shipment ID
   */
  async getTracking(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const normalized = id.trim().toUpperCase();

    return safeFetchJson<{ success: boolean; data?: any; error?: string }>(
      `/api/uniuni/tracking/${encodeURIComponent(normalized)}`,
      undefined,
      () => {
        const shipments = getStoredShipments();
        const found = shipments.find(
          (s) =>
            s.trackingNumber.toUpperCase() === normalized ||
            s.id.toUpperCase() === normalized ||
            s.orderNumber.toUpperCase() === normalized
        );

        if (found) {
          return {
            success: true,
            data: {
              trackingNumber: found.trackingNumber,
              orderNumber: found.orderNumber,
              status: found.status,
              serviceType: found.serviceType,
              destinationAirport: found.destinationAirport || 'YYZ',
              sortingZone: found.sortingZone || 'A',
              sortCode: found.sortCode || 'YYZ-A 021',
              sender: {
                name: found.sender?.name || 'Sender',
                city: found.sender?.city || 'Mississauga',
                country: found.sender?.countryCode || 'CA',
              },
              recipient: {
                name: found.recipient?.name || 'Recipient',
                city: found.recipient?.city || 'Toronto',
                province: found.recipient?.stateOrProvince || 'ON',
                postalCode: found.recipient?.postalCode || 'M5V 2X4',
                country: found.recipient?.countryCode || 'CA',
              },
              events: found.scanEvents || [
                {
                  timestamp: new Date().toISOString(),
                  status: found.status,
                  statusText: `Shipment status updated to ${found.status}`,
                  location: 'Regional Sorting Facility',
                  facilityCode: `${found.destinationAirport || 'YYZ'}-HUB`,
                },
              ],
              proofOfDelivery: found.proofOfDelivery,
            },
          };
        }

        // Check if query looks like a valid tracking number
        const isCanada = normalized.startsWith('UNI') || /^[A-Z]\d[A-Z]/i.test(normalized);
        const sortInfo = getUniUniSortCode(isCanada ? 'M5V 2X4' : '90012', isCanada ? 'CA' : 'US');

        return {
          success: true,
          data: {
            trackingNumber: normalized,
            orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
            status: 'IN_TRANSIT',
            serviceType: isCanada ? 'UNI_STANDARD' : 'UNI_CROSSBORDER_EXPEDITE',
            destinationAirport: sortInfo.airportCode,
            sortingZone: sortInfo.area,
            sortCode: sortInfo.fullSortCode,
            sender: {
              name: 'Apex Gateway Logistics',
              city: isCanada ? 'Mississauga' : 'Los Angeles',
              country: isCanada ? 'CA' : 'US',
            },
            recipient: {
              name: 'Customer Parcel',
              city: isCanada ? 'Toronto' : 'Los Angeles',
              province: isCanada ? 'ON' : 'CA',
              postalCode: isCanada ? 'M5V 2X4' : '90012',
              country: isCanada ? 'CA' : 'US',
            },
            events: [
              {
                timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
                status: 'IN_TRANSIT',
                statusText: `Processed through automated parcel sortation at ${sortInfo.airportCode} Hub`,
                location: sortInfo.hubName,
                facilityCode: `${sortInfo.airportCode}-HUB`,
              },
              {
                timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
                status: 'RECEIVED_AT_FACILITY',
                statusText: 'Electronic manifest received & parcel inducted',
                location: 'Intake Gateway Dock',
                facilityCode: `${sortInfo.airportCode}-GW`,
              },
            ],
          },
        };
      }
    );
  },

  /**
   * Purchase label
   */
  async purchaseShipment(shipmentId: string): Promise<{ success: boolean; shipment?: Shipment }> {
    return safeFetchJson<{ success: boolean; shipment?: Shipment }>(
      `/api/uniuni/shipments/${shipmentId}/purchase`,
      { method: 'POST' },
      () => {
        const shipments = getStoredShipments();
        const idx = shipments.findIndex((s) => s.id === shipmentId);
        if (idx !== -1) {
          shipments[idx].status = 'PURCHASED';
          shipments[idx].purchasedAt = new Date().toISOString();
          shipments[idx].scanEvents = [
            {
              timestamp: new Date().toISOString(),
              status: 'PURCHASED',
              statusText: 'Shipping label purchased and barcode generated',
              location: 'Customer Warehouse / Online API',
              facilityCode: 'API-PORTAL',
            },
            ...(shipments[idx].scanEvents || []),
          ];
          setStoredShipments(shipments);
          return { success: true, shipment: shipments[idx] };
        }
        return { success: false };
      }
    );
  },

  /**
   * Cancel shipment
   */
  async cancelShipment(shipmentId: string): Promise<{ success: boolean }> {
    return safeFetchJson<{ success: boolean }>(
      `/api/uniuni/shipments/${shipmentId}/cancel`,
      { method: 'POST' },
      () => {
        const shipments = getStoredShipments();
        const idx = shipments.findIndex((s) => s.id === shipmentId);
        if (idx !== -1) {
          shipments[idx].status = 'CANCELLED';
          setStoredShipments(shipments);
          return { success: true };
        }
        return { success: false };
      }
    );
  },

  /**
   * Advance tracking milestone
   */
  async advanceMilestone(shipmentId: string, nextStatus: string): Promise<{ success: boolean; shipment?: Shipment }> {
    return safeFetchJson<{ success: boolean; shipment?: Shipment }>(
      `/api/uniuni/shipments/${shipmentId}/advance`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStatus }),
      },
      () => {
        const shipments = getStoredShipments();
        const idx = shipments.findIndex((s) => s.id === shipmentId);
        if (idx !== -1) {
          const validatedStatus = nextStatus as ShipmentStatus;
          shipments[idx].status = validatedStatus;
          const newEvent = {
            timestamp: new Date().toISOString(),
            status: validatedStatus,
            statusText: `Milestone advanced to ${nextStatus.replace(/_/g, ' ')}`,
            location: `${shipments[idx].destinationAirport || 'YYZ'} Regional Hub`,
            facilityCode: `${shipments[idx].destinationAirport || 'YYZ'}-STA`,
          };
          shipments[idx].scanEvents = [newEvent, ...(shipments[idx].scanEvents || [])];

          if (nextStatus === 'DELIVERED') {
            shipments[idx].deliveredAt = new Date().toISOString();
            shipments[idx].proofOfDelivery = {
              deliveredAt: new Date().toISOString(),
              recipientName: shipments[idx].recipient.name || 'Front Porch',
              locationDescription: 'Front door porch (Contactless drop-off)',
              photoUrl:
                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
            };
          }
          setStoredShipments(shipments);
          return { success: true, shipment: shipments[idx] };
        }
        return { success: false };
      }
    );
  },

  /**
   * Create new shipment
   */
  async createShipment(payload: any): Promise<{ success: boolean; shipment?: Shipment; message?: string }> {
    return safeFetchJson<{ success: boolean; shipment?: Shipment; message?: string }>(
      '/api/uniuni/shipments',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => {
        const recipientCountry = payload.recipient?.countryCode || 'CA';
        const sortInfo = getUniUniSortCode(payload.recipient?.postalCode || 'M5V 2X4', recipientCountry);

        const prefix = recipientCountry === 'US' ? 'UUS' : 'UNI';
        const randomDigits = Math.floor(1000000000000 + Math.random() * 9000000000000);
        const trackingNumber = `${prefix}${randomDigits}`;

        const newShipment: Shipment = {
          id: `shp_uni_${Date.now()}`,
          orderNumber: payload.orderNumber || `ORD-${Date.now().toString().slice(-4)}`,
          trackingNumber,
          status: 'DRAFT',
          serviceType: payload.serviceType || (recipientCountry === 'US' ? 'UNI_CROSSBORDER_EXPEDITE' : 'UNI_STANDARD'),
          sender: payload.sender,
          recipient: payload.recipient,
          package: payload.package,
          shipmentLineItems: payload.shipmentLineItems || [],
          sortCode: sortInfo.fullSortCode,
          destinationAirport: sortInfo.airportCode,
          sortingZone: sortInfo.area,
          rate: payload.rate || 5.85,
          currency: recipientCountry === 'US' ? 'USD' : 'CAD',
          createdAt: new Date().toISOString(),
          scanEvents: [
            {
              timestamp: new Date().toISOString(),
              status: 'DRAFT',
              statusText: 'Shipment created via UniUni API integration',
              location: `${sortInfo.airportCode} Gateway`,
              facilityCode: `${sortInfo.airportCode}-INT`,
            },
          ],
        };

        const shipments = getStoredShipments();
        const updated = [newShipment, ...shipments];
        setStoredShipments(updated);

        return { success: true, shipment: newShipment };
      }
    );
  },

  /**
   * Fetch all batch manifests
   */
  async getBatches(): Promise<{ success: boolean; batches: BatchManifest[] }> {
    return safeFetchJson<{ success: boolean; batches: BatchManifest[] }>(
      '/api/uniuni/batches',
      undefined,
      () => ({
        success: true,
        batches: getStoredBatches(),
      })
    );
  },

  /**
   * Create new batch manifest
   */
  async createBatch(payload: {
    shipmentIds: string[];
    hubCode: string;
    driverName: string;
  }): Promise<{ success: boolean; batch?: BatchManifest }> {
    return safeFetchJson<{ success: boolean; batch?: BatchManifest }>(
      '/api/uniuni/batches',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => {
        const shipments = getStoredShipments();
        const batchShipments = shipments.filter((s) => payload.shipmentIds.includes(s.id));
        const totalWeight = batchShipments.reduce((sum, s) => sum + (s.package?.weight || 1), 0);

        const newBatch: BatchManifest = {
          id: `bat_uni_${Date.now()}`,
          batchNumber: `MNF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          createdAt: new Date().toISOString(),
          shipmentIds: payload.shipmentIds,
          totalShipments: payload.shipmentIds.length,
          totalWeightKg: parseFloat(totalWeight.toFixed(2)),
          hubCode: payload.hubCode || 'YYZ-01 (Toronto Gateway)',
          driverName: payload.driverName || 'Assigned Uni Courier',
          status: 'DISPATCHED',
        };

        const batches = getStoredBatches();
        const updated = [newBatch, ...batches];
        setStoredBatches(updated);

        return { success: true, batch: newBatch };
      }
    );
  },

  /**
   * Fetch webhook logs
   */
  async getWebhookLogs(): Promise<{ success: boolean; logs: WebhookEventRecord[] }> {
    return safeFetchJson<{ success: boolean; logs: WebhookEventRecord[] }>(
      '/api/uniuni/webhooks/logs',
      undefined,
      () => ({
        success: true,
        logs: getStoredWebhookLogs(),
      })
    );
  },

  /**
   * Simulate webhook event
   */
  async simulateWebhook(payload: {
    eventType: string;
    targetUrl: string;
    secretKey: string;
    shipmentId: string;
  }): Promise<{ success: boolean; log?: WebhookEventRecord }> {
    return safeFetchJson<{ success: boolean; log?: WebhookEventRecord }>(
      '/api/uniuni/webhooks/simulate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => {
        const shipments = getStoredShipments();
        const targetShipment = shipments.find((s) => s.id === payload.shipmentId) || shipments[0];

        const newLog: WebhookEventRecord = {
          id: `wh_log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: payload.eventType,
          targetUrl: payload.targetUrl,
          status: 'SUCCESS',
          httpResponseCode: 200,
          signature: `t=${Math.floor(Date.now() / 1000)},v1=uni_sig_${Math.random().toString(36).substring(2, 12)}`,
          payload: {
            event: payload.eventType,
            timestamp: new Date().toISOString(),
            trackingNumber: targetShipment?.trackingNumber || 'UNI904817294819203',
            orderNumber: targetShipment?.orderNumber || 'ORD-2026-9021',
            status: targetShipment?.status || 'IN_TRANSIT',
            location: `${targetShipment?.destinationAirport || 'YYZ'} Regional Sorting Hub`,
            sortCode: targetShipment?.sortCode || 'YYZ-A 021',
            proofOfDelivery: targetShipment?.proofOfDelivery,
          },
        };

        const logs = getStoredWebhookLogs();
        const updated = [newLog, ...logs];
        setStoredWebhookLogs(updated);

        return { success: true, log: newLog };
      }
    );
  },

  /**
   * Execute API Explorer request
   */
  async executeApiExplorer(payload: any): Promise<any> {
    return safeFetchJson<any>(
      '/api/uniuni/proxy',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => {
        return {
          success: true,
          status: 200,
          statusText: '200 OK (Sandbox Simulated)',
          durationMs: 42,
          data: payload.mockFallback || {
            code: 200,
            message: 'Success',
            data: { status: 'OK', timestamp: new Date().toISOString() },
          },
        };
      }
    );
  },
};
