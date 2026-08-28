import React, { useState } from 'react';
import { CountryCode } from '../types/uniuni';
import { calculateUniUniRates } from '../utils/uniuniRouting';
import { Calculator, DollarSign, Box, Shield, Check, ArrowRight, Zap, Info } from 'lucide-react';

export const RateCalculatorView: React.FC = () => {
  const [originCountry, setOriginCountry] = useState<CountryCode>('CA');
  const [originPostal, setOriginPostal] = useState('L5T 2B7');
  const [destCountry, setDestCountry] = useState<CountryCode>('CA');
  const [destPostal, setDestPostal] = useState('M5V 2X4');

  const [weight, setWeight] = useState(1.5);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const [length, setLength] = useState(25);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(10);
  const [dimUnit, setDimUnit] = useState<'cm' | 'in'>('cm');

  const [signatureRequired, setSignatureRequired] = useState(false);
  const [insuranceValue, setInsuranceValue] = useState(0);

  const rates = calculateUniUniRates({
    originPostal,
    originCountry,
    destPostal,
    destCountry,
    weight,
    weightUnit,
    length,
    width,
    height,
    dimUnit,
    signatureRequired,
    insuranceValue,
  });

  const weightKg = weightUnit === 'lb' ? weight * 0.453592 : weight;
  const lCm = dimUnit === 'in' ? length * 2.54 : length;
  const wCm = dimUnit === 'in' ? width * 2.54 : width;
  const hCm = dimUnit === 'in' ? height * 2.54 : height;
  const volWeight = (lCm * wCm * hCm) / 5000;
  const billableWeight = Math.max(weightKg, volWeight, 0.2);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
            UniUni Rating & Quoting Engine
          </div>
          <h2 className="text-xl font-bold">Calculate Instant Shipping Rates</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live quoting with dimensional volumetric divisor (5000 / 6000), fuel surcharges, and cross-border customs clearance fees for Canada & US lanes.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono text-xs shrink-0">
          <div className="text-slate-400 text-[10px]">BILLABLE WEIGHT RULE:</div>
          <div className="text-emerald-400 font-bold text-sm">MAX(Actual Wt, Volumetric Wt)</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Vol = (L x W x H cm) / 5000</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Shipment Parameters
          </h3>

          {/* Origin */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">Origin Location</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value as CountryCode)}
                className="px-2.5 py-2 rounded-lg border border-slate-300 font-bold"
              >
                <option value="CA">🇨🇦 Canada (CA)</option>
                <option value="US">🇺🇸 United States (US)</option>
              </select>
              <input
                type="text"
                value={originPostal}
                onChange={(e) => setOriginPostal(e.target.value.toUpperCase())}
                placeholder="Origin Postal Code"
                className="px-2.5 py-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">Destination Location</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={destCountry}
                onChange={(e) => setDestCountry(e.target.value as CountryCode)}
                className="px-2.5 py-2 rounded-lg border border-slate-300 font-bold"
              >
                <option value="CA">🇨🇦 Canada (CA)</option>
                <option value="US">🇺🇸 United States (US)</option>
              </select>
              <input
                type="text"
                value={destPostal}
                onChange={(e) => setDestPostal(e.target.value.toUpperCase())}
                placeholder="Dest Postal Code"
                className="px-2.5 py-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700 uppercase tracking-wider">Actual Weight</label>
            <div className="flex">
              <input
                type="number"
                step="0.05"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-2 rounded-l-lg border border-slate-300 font-mono font-bold"
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as any)}
                className="bg-slate-100 border border-l-0 border-slate-300 px-3 rounded-r-lg font-mono font-bold"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-700 uppercase tracking-wider">Dimensions (L x W x H)</label>
              <span className="font-mono text-slate-500 font-bold">{dimUnit}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                placeholder="L"
                className="px-2 py-1.5 rounded border border-slate-300 font-mono text-center"
              />
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                placeholder="W"
                className="px-2 py-1.5 rounded border border-slate-300 font-mono text-center"
              />
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                placeholder="H"
                className="px-2 py-1.5 rounded border border-slate-300 font-mono text-center"
              />
            </div>
          </div>

          {/* Add-ons */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={signatureRequired}
                onChange={(e) => setSignatureRequired(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700">Signature on Delivery (+$1.75)</span>
            </label>

            <div className="flex items-center justify-between">
              <span className="text-slate-700">Declared Value ($):</span>
              <input
                type="number"
                value={insuranceValue}
                onChange={(e) => setInsuranceValue(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-right"
              />
            </div>
          </div>
        </div>

        {/* Rate Results Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Weight Analysis Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Actual Weight</span>
                <span className="font-bold text-slate-900 font-mono">{weightKg.toFixed(2)} kg</span>
              </div>
              <div className="text-slate-300 font-bold">vs</div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Volumetric Weight</span>
                <span className="font-bold text-slate-900 font-mono">{volWeight.toFixed(2)} kg</span>
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Billable Weight Applied: <strong>{billableWeight.toFixed(2)} kg</strong>
              </span>
            </div>
          </div>

          {/* Quotes List */}
          <div className="grid grid-cols-1 gap-3.5">
            {rates.map((rate) => (
              <div
                key={rate.serviceCode}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-500 transition relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rate.serviceName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700">
                        {rate.serviceCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>Transit SLA: <strong className="text-slate-700">{rate.estimatedDays}</strong></span>
                      <span>•</span>
                      <span>100% Photo Proof of Delivery Included</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      ${rate.cost.toFixed(2)}{' '}
                      <span className="text-xs font-semibold text-slate-600">{rate.currency}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Base: ${rate.breakdown.baseRate.toFixed(2)} + Fuel: ${rate.breakdown.fuelSurcharge.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes and Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-500" />
              UniUni Transparent Pricing Rules
            </div>
            <p className="text-[11px] leading-relaxed">
              • Fuel surcharge updates weekly based on Canadian and US regional averages.
              <br />
              • Cross-border parcels (CA to US) under $800 USD qualify for US Customs Section 321 Duty-Free exemption.
              <br />
              • Commercial contract volume discounts apply automatically when using your linked customer account number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
