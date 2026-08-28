export type UniUniEnvironment =
  | 'sandbox_global'
  | 'prod_global'
  | 'ca_qa'
  | 'ca_prod'
  | 'us_qa'
  | 'us_prod'
  | 'mock_simulated';

export interface UniUniConfig {
  environment: UniUniEnvironment;
  accessToken: string;
  clientId: string;
  clientSecret: string;
  customerNumber: string;
  autoSimulateIfOffline: boolean;
}

export type CountryCode = 'CA' | 'US';

export interface Address {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: CountryCode;
  buzzCode?: string;
  deliveryInstructions?: string;
}

export interface ParcelDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ParcelDetails {
  weight: number;
  weightUnit: 'kg' | 'lb';
  dimensions: ParcelDimensions;
  packagingType?: 'polybag' | 'box_small' | 'box_medium' | 'box_large' | 'custom';
  packagingId?: string;
  signatureRequired?: boolean;
  insuranceValue?: number;
  currency?: 'CAD' | 'USD';
}

export interface ShipmentLineItem {
  id?: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: 'CAD' | 'USD';
  hsCode?: string;
  countryOfOrigin?: string;
  manufacturer?: string;
}

export type ShipmentStatus =
  | 'DRAFT'
  | 'PURCHASED'
  | 'RECEIVED_AT_FACILITY'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION'
  | 'CANCELLED'
  | 'REFUNDED';

export interface ScanEvent {
  timestamp: string;
  status: ShipmentStatus;
  statusText: string;
  location: string;
  facilityCode?: string;
  details?: string;
}

export interface ProofOfDelivery {
  deliveredAt: string;
  recipientName?: string;
  locationDescription: string;
  photoUrl?: string;
  signatureUrl?: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Shipment {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  status: ShipmentStatus;
  serviceType: 'UNI_STANDARD' | 'UNI_PRIORITY' | 'UNI_CROSSBORDER_EXPEDITE';
  sender: Address;
  recipient: Address;
  package: ParcelDetails;
  shipmentLineItems: ShipmentLineItem[];
  sortCode: string;
  destinationAirport: string;
  sortingZone: string;
  rate: number;
  currency: 'CAD' | 'USD';
  createdAt: string;
  purchasedAt?: string;
  deliveredAt?: string;
  labelUrl?: string;
  batchId?: string;
  scanEvents: ScanEvent[];
  proofOfDelivery?: ProofOfDelivery;
  notes?: string;
}

export interface SortCodeInfo {
  postalCode: string;
  country: CountryCode;
  isCovered: boolean;
  port: string;
  area: string;
  routeNumber: string;
  fullSortCode: string;
  airportCode: string;
  hubName: string;
  metroArea: string;
  estimatedTransitDays: number;
  supportedServices: string[];
}

export interface RateQuoteOption {
  serviceCode: 'UNI_STANDARD' | 'UNI_PRIORITY' | 'UNI_CROSSBORDER_EXPEDITE';
  serviceName: string;
  cost: number;
  currency: 'CAD' | 'USD';
  estimatedDays: string;
  volumetricWeight: number;
  billableWeight: number;
  breakdown: {
    baseRate: number;
    fuelSurcharge: number;
    signatureFee?: number;
    insuranceFee?: number;
  };
}

export interface BatchManifest {
  id: string;
  batchNumber: string;
  status: 'OPEN' | 'CLOSED' | 'DISPATCHED';
  createdAt: string;
  dispatchedAt?: string;
  shipmentIds: string[];
  totalShipments: number;
  totalWeightKg: number;
  driverName?: string;
  driverSignature?: string;
  hubCode: string;
}

export interface WebhookEventRecord {
  id: string;
  event: string;
  timestamp: string;
  payload: Record<string, unknown>;
  targetUrl: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  httpResponseCode?: number;
  signature: string;
  durationMs?: number;
}

export interface ApiEndpointDefinition {
  id: string;
  name: string;
  category: 'Shipments' | 'Tracking' | 'Rates' | 'Sort Codes' | 'Batches' | 'Auth';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestSchemaExample: Record<string, unknown>;
  responseSchemaExample: Record<string, unknown>;
  headers?: Record<string, string>;
}
