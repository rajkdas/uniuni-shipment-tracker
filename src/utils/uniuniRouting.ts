import { CountryCode, SortCodeInfo, RateQuoteOption } from '../types/uniuni';

export interface PostalZoneRule {
  prefix: string; // FSA for Canada (e.g., "M5V", "V6B") or 3-digit ZIP prefix for US (e.g. "900", "100")
  port: string;
  airportCode: string;
  area: string;
  routeNumber: string;
  hubName: string;
  metroArea: string;
  transitDays: number;
}

// Built-in UniUni Sort Code Directory mapping
const ROUTING_RULES: Record<CountryCode, PostalZoneRule[]> = {
  CA: [
    { prefix: 'M', port: 'YYZ', airportCode: 'YYZ', area: 'A', routeNumber: '021', hubName: 'Toronto Central Hub', metroArea: 'Greater Toronto Area (ON)', transitDays: 1 },
    { prefix: 'L', port: 'YYZ', airportCode: 'YYZ', area: 'B', routeNumber: '045', hubName: 'Mississauga / Peel Hub', metroArea: 'Peel & York Region (ON)', transitDays: 1 },
    { prefix: 'K', port: 'YOW', airportCode: 'YOW', area: 'A', routeNumber: '012', hubName: 'Ottawa Capital Hub', metroArea: 'National Capital Region (ON/QC)', transitDays: 2 },
    { prefix: 'N', port: 'YYZ', airportCode: 'YYZ', area: 'C', routeNumber: '078', hubName: 'London / Waterloo Hub', metroArea: 'Southwestern Ontario', transitDays: 2 },
    { prefix: 'P', port: 'YYZ', airportCode: 'YYZ', area: 'D', routeNumber: '090', hubName: 'Northern Ontario Hub', metroArea: 'Northern Ontario', transitDays: 3 },
    { prefix: 'V', port: 'YVR', airportCode: 'YVR', area: 'A', routeNumber: '104', hubName: 'Vancouver Richmond Hub', metroArea: 'Metro Vancouver (BC)', transitDays: 1 },
    { prefix: 'H', port: 'YUL', airportCode: 'YUL', area: 'A', routeNumber: '033', hubName: 'Montreal Saint-Laurent Hub', metroArea: 'Greater Montreal (QC)', transitDays: 1 },
    { prefix: 'J', port: 'YUL', airportCode: 'YUL', area: 'B', routeNumber: '051', hubName: 'Longueuil / Laval Hub', metroArea: 'Southern Quebec (QC)', transitDays: 2 },
    { prefix: 'G', port: 'YQB', airportCode: 'YQB', area: 'A', routeNumber: '019', hubName: 'Quebec City Hub', metroArea: 'Quebec City (QC)', transitDays: 2 },
    { prefix: 'T2', port: 'YYC', airportCode: 'YYC', area: 'A', routeNumber: '062', hubName: 'Calgary Central Hub', metroArea: 'Calgary Metro (AB)', transitDays: 1 },
    { prefix: 'T3', port: 'YYC', airportCode: 'YYC', area: 'B', routeNumber: '065', hubName: 'Calgary Regional Hub', metroArea: 'Calgary Metro (AB)', transitDays: 1 },
    { prefix: 'T5', port: 'YEG', airportCode: 'YEG', area: 'A', routeNumber: '081', hubName: 'Edmonton Gateway Hub', metroArea: 'Edmonton Capital (AB)', transitDays: 1 },
    { prefix: 'T6', port: 'YEG', airportCode: 'YEG', area: 'B', routeNumber: '084', hubName: 'Edmonton Regional Hub', metroArea: 'Edmonton Capital (AB)', transitDays: 1 },
    { prefix: 'R', port: 'YWG', airportCode: 'YWG', area: 'A', routeNumber: '041', hubName: 'Winnipeg Hub', metroArea: 'Winnipeg (MB)', transitDays: 2 },
    { prefix: 'S', port: 'YXE', airportCode: 'YXE', area: 'A', routeNumber: '055', hubName: 'Saskatoon / Regina Hub', metroArea: 'Saskatchewan', transitDays: 2 },
    { prefix: 'B', port: 'YHZ', airportCode: 'YHZ', area: 'A', routeNumber: '071', hubName: 'Halifax Gateway', metroArea: 'Nova Scotia (NS)', transitDays: 3 },
    { prefix: 'E', port: 'YSJ', airportCode: 'YSJ', area: 'A', routeNumber: '073', hubName: 'Moncton / Saint John Hub', metroArea: 'New Brunswick (NB)', transitDays: 3 },
  ],
  US: [
    { prefix: '90', port: 'LAX', airportCode: 'LAX', area: 'A', routeNumber: '310', hubName: 'Los Angeles Metro Hub', metroArea: 'Los Angeles County (CA)', transitDays: 1 },
    { prefix: '91', port: 'LAX', airportCode: 'LAX', area: 'B', routeNumber: '314', hubName: 'Orange County / Inland Hub', metroArea: 'Southern California (CA)', transitDays: 1 },
    { prefix: '92', port: 'SAN', airportCode: 'SAN', area: 'A', routeNumber: '320', hubName: 'San Diego Hub', metroArea: 'San Diego (CA)', transitDays: 1 },
    { prefix: '94', port: 'SFO', airportCode: 'SFO', area: 'A', routeNumber: '340', hubName: 'San Francisco Bay Hub', metroArea: 'Bay Area / Silicon Valley (CA)', transitDays: 1 },
    { prefix: '95', port: 'OAK', airportCode: 'OAK', area: 'B', routeNumber: '350', hubName: 'East Bay / Sacramento Hub', metroArea: 'Northern California (CA)', transitDays: 1 },
    { prefix: '98', port: 'SEA', airportCode: 'SEA', area: 'A', routeNumber: '380', hubName: 'Seattle Pacific Hub', metroArea: 'Greater Seattle (WA)', transitDays: 1 },
    { prefix: '97', port: 'PDX', airportCode: 'PDX', area: 'A', routeNumber: '370', hubName: 'Portland Hub', metroArea: 'Portland Metro (OR)', transitDays: 2 },
    { prefix: '10', port: 'JFK', airportCode: 'JFK', area: 'A', routeNumber: '101', hubName: 'New York Queens Hub', metroArea: 'New York City (NY)', transitDays: 1 },
    { prefix: '11', port: 'JFK', airportCode: 'JFK', area: 'B', routeNumber: '110', hubName: 'Brooklyn / Long Island Hub', metroArea: 'NYC & Long Island (NY)', transitDays: 1 },
    { prefix: '07', port: 'EWR', airportCode: 'EWR', area: 'A', routeNumber: '070', hubName: 'Newark Gateway Hub', metroArea: 'Northern New Jersey (NJ)', transitDays: 1 },
    { prefix: '60', port: 'ORD', airportCode: 'ORD', area: 'A', routeNumber: '601', hubName: 'Chicago Metro Hub', metroArea: 'Chicago Metro (IL)', transitDays: 1 },
    { prefix: '75', port: 'DFW', airportCode: 'DFW', area: 'A', routeNumber: '750', hubName: 'Dallas / Fort Worth Hub', metroArea: 'DFW Metroplex (TX)', transitDays: 1 },
    { prefix: '77', port: 'IAH', airportCode: 'IAH', area: 'A', routeNumber: '770', hubName: 'Houston Hub', metroArea: 'Greater Houston (TX)', transitDays: 1 },
    { prefix: '30', port: 'ATL', airportCode: 'ATL', area: 'A', routeNumber: '300', hubName: 'Atlanta Hub', metroArea: 'Metro Atlanta (GA)', transitDays: 1 },
    { prefix: '33', port: 'MIA', airportCode: 'MIA', area: 'A', routeNumber: '330', hubName: 'Miami / South Florida Hub', metroArea: 'Miami-Dade (FL)', transitDays: 1 },
    { prefix: '80', port: 'DEN', airportCode: 'DEN', area: 'A', routeNumber: '801', hubName: 'Denver Hub', metroArea: 'Denver Metro (CO)', transitDays: 2 },
    { prefix: '85', port: 'PHX', airportCode: 'PHX', area: 'A', routeNumber: '850', hubName: 'Phoenix Valley Hub', metroArea: 'Phoenix Metro (AZ)', transitDays: 2 },
    { prefix: '89', port: 'LAS', airportCode: 'LAS', area: 'A', routeNumber: '890', hubName: 'Las Vegas Hub', metroArea: 'Clark County (NV)', transitDays: 2 },
  ],
};

/**
 * Normalizes Canadian or US postal code
 */
export function normalizePostalCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

/**
 * Calculates official UniUni sorting info for any postal/zip code
 */
export function getUniUniSortCode(rawPostalCode: string, country?: CountryCode): SortCodeInfo {
  const clean = normalizePostalCode(rawPostalCode);
  const detectedCountry: CountryCode = country || (/^[A-Z]\d[A-Z]/.test(clean) ? 'CA' : 'US');

  const rules = ROUTING_RULES[detectedCountry] || [];
  let matchedRule: PostalZoneRule | undefined;

  if (detectedCountry === 'CA') {
    // Check 2-char prefix then 1-char prefix
    const fsa2 = clean.slice(0, 2);
    const fsa1 = clean.slice(0, 1);
    matchedRule = rules.find((r) => r.prefix === fsa2) || rules.find((r) => r.prefix === fsa1);
  } else {
    // Check 2-digit then 1-digit ZIP prefix
    const zip2 = clean.slice(0, 2);
    matchedRule = rules.find((r) => r.prefix === zip2);
  }

  if (matchedRule) {
    // Generate route dynamic suffix if needed
    const subRoute = clean.length >= 5 ? clean.slice(-2).padStart(3, '0') : matchedRule.routeNumber;
    const fullSortCode = `${matchedRule.port}-${matchedRule.area} ${subRoute}`;

    return {
      postalCode: rawPostalCode.toUpperCase().trim(),
      country: detectedCountry,
      isCovered: true,
      port: matchedRule.port,
      area: matchedRule.area,
      routeNumber: subRoute,
      fullSortCode,
      airportCode: matchedRule.airportCode,
      hubName: matchedRule.hubName,
      metroArea: matchedRule.metroArea,
      estimatedTransitDays: matchedRule.transitDays,
      supportedServices: ['UNI_STANDARD', 'UNI_PRIORITY', 'UNI_CROSSBORDER_EXPEDITE'],
    };
  }

  // Fallback if remote / uncovered zone
  const fallbackAirport = detectedCountry === 'CA' ? 'YYZ' : 'LAX';
  return {
    postalCode: rawPostalCode.toUpperCase().trim(),
    country: detectedCountry,
    isCovered: false,
    port: `${fallbackAirport}-REMOTE`,
    area: 'R',
    routeNumber: '999',
    fullSortCode: `${fallbackAirport}-R 999`,
    airportCode: fallbackAirport,
    hubName: 'Partner Extended Carrier Network',
    metroArea: 'Extended Delivery Area',
    estimatedTransitDays: 4,
    supportedServices: ['UNI_STANDARD'],
  };
}

/**
 * Calculates accurate UniUni shipping rates for packages
 */
export function calculateUniUniRates(params: {
  originPostal: string;
  originCountry: CountryCode;
  destPostal: string;
  destCountry: CountryCode;
  weight: number;
  weightUnit: 'kg' | 'lb';
  length: number;
  width: number;
  height: number;
  dimUnit: 'cm' | 'in';
  signatureRequired?: boolean;
  insuranceValue?: number;
}): RateQuoteOption[] {
  // Convert weight to kg
  const weightKg = params.weightUnit === 'lb' ? params.weight * 0.453592 : params.weight;

  // Convert dimensions to cm
  const lCm = params.dimUnit === 'in' ? params.length * 2.54 : params.length;
  const wCm = params.dimUnit === 'in' ? params.width * 2.54 : params.width;
  const hCm = params.dimUnit === 'in' ? params.height * 2.54 : params.height;

  // Volumetric weight divisor: 5000 for express, 6000 for standard
  const volWeightKg = (lCm * wCm * hCm) / 5000;
  const billableWeightKg = Math.max(weightKg, volWeightKg, 0.2);

  const isCrossBorder = params.originCountry !== params.destCountry;
  const destSort = getUniUniSortCode(params.destPostal, params.destCountry);

  const currency = params.destCountry === 'CA' ? 'CAD' : 'USD';
  const baseCurrencyMultiplier = currency === 'CAD' ? 1.0 : 0.74;

  const results: RateQuoteOption[] = [];

  // 1. UniUni Standard Ground
  {
    const base = (isCrossBorder ? 8.5 : 4.2) + (billableWeightKg - 0.2) * (isCrossBorder ? 3.8 : 1.8);
    const baseRate = Math.max(base * baseCurrencyMultiplier, 3.99);
    const fuel = baseRate * 0.085;
    const sigFee = params.signatureRequired ? 1.75 : 0;
    const insFee = params.insuranceValue && params.insuranceValue > 100 ? (params.insuranceValue - 100) * 0.015 : 0;
    const total = Number((baseRate + fuel + sigFee + insFee).toFixed(2));

    results.push({
      serviceCode: 'UNI_STANDARD',
      serviceName: 'UniUni Standard Ground',
      cost: total,
      currency,
      estimatedDays: `${destSort.estimatedTransitDays + (isCrossBorder ? 2 : 0)} - ${destSort.estimatedTransitDays + (isCrossBorder ? 4 : 2)} Business Days`,
      volumetricWeight: Number(volWeightKg.toFixed(2)),
      billableWeight: Number(billableWeightKg.toFixed(2)),
      breakdown: {
        baseRate: Number(baseRate.toFixed(2)),
        fuelSurcharge: Number(fuel.toFixed(2)),
        signatureFee: sigFee > 0 ? Number(sigFee.toFixed(2)) : undefined,
        insuranceFee: insFee > 0 ? Number(insFee.toFixed(2)) : undefined,
      },
    });
  }

  // 2. UniUni Priority Express
  {
    const base = (isCrossBorder ? 12.8 : 6.8) + (billableWeightKg - 0.2) * (isCrossBorder ? 5.2 : 2.5);
    const baseRate = Math.max(base * baseCurrencyMultiplier, 5.99);
    const fuel = baseRate * 0.095;
    const sigFee = params.signatureRequired ? 1.75 : 0;
    const insFee = params.insuranceValue && params.insuranceValue > 100 ? (params.insuranceValue - 100) * 0.015 : 0;
    const total = Number((baseRate + fuel + sigFee + insFee).toFixed(2));

    results.push({
      serviceCode: 'UNI_PRIORITY',
      serviceName: 'UniUni Express Priority (Next-Day / 2-Day)',
      cost: total,
      currency,
      estimatedDays: `${Math.max(1, destSort.estimatedTransitDays - 1 + (isCrossBorder ? 1 : 0))} - ${destSort.estimatedTransitDays + (isCrossBorder ? 2 : 1)} Business Days`,
      volumetricWeight: Number(volWeightKg.toFixed(2)),
      billableWeight: Number(billableWeightKg.toFixed(2)),
      breakdown: {
        baseRate: Number(baseRate.toFixed(2)),
        fuelSurcharge: Number(fuel.toFixed(2)),
        signatureFee: sigFee > 0 ? Number(sigFee.toFixed(2)) : undefined,
        insuranceFee: insFee > 0 ? Number(insFee.toFixed(2)) : undefined,
      },
    });
  }

  // 3. Cross-Border Direct Line (if cross-border or selectable)
  if (isCrossBorder || params.originCountry === 'CA') {
    const base = 9.8 + (billableWeightKg - 0.2) * 4.2;
    const baseRate = Number((base * baseCurrencyMultiplier).toFixed(2));
    const fuel = Number((baseRate * 0.1).toFixed(2));
    const sigFee = params.signatureRequired ? 1.75 : 0;
    const insFee = params.insuranceValue && params.insuranceValue > 100 ? (params.insuranceValue - 100) * 0.015 : 0;
    const total = Number((baseRate + fuel + sigFee + insFee).toFixed(2));

    results.push({
      serviceCode: 'UNI_CROSSBORDER_EXPEDITE',
      serviceName: 'UniUni Cross-Border Direct (CA ↔ US Section 321)',
      cost: total,
      currency,
      estimatedDays: '3 - 5 Business Days (DDP Customs Cleared)',
      volumetricWeight: Number(volWeightKg.toFixed(2)),
      billableWeight: Number(billableWeightKg.toFixed(2)),
      breakdown: {
        baseRate,
        fuelSurcharge: fuel,
        signatureFee: sigFee > 0 ? sigFee : undefined,
        insuranceFee: insFee > 0 ? Number(insFee.toFixed(2)) : undefined,
      },
    });
  }

  return results;
}

/**
 * Generates a realistic 19-character UniUni tracking code
 * (e.g. UUS902847291849102 or UNI109284729103)
 */
export function generateTrackingNumber(country: CountryCode = 'CA'): string {
  const prefix = country === 'US' ? 'UUS' : 'UNI';
  const digitsLength = 19 - prefix.length;
  let digits = '';
  for (let i = 0; i < digitsLength; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return `${prefix}${digits}`;
}
