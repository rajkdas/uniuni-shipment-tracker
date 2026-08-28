import React, { useState, useEffect } from 'react';
import { Address, CountryCode, ParcelDetails, ShipmentLineItem } from '../types/uniuni';
import { getUniUniSortCode, calculateUniUniRates } from '../utils/uniuniRouting';
import { X, Box, User, MapPin, DollarSign, Sparkles, Check, ArrowRight, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const PRESET_ADDRESSES: { label: string; country: CountryCode; recipient: Address }[] = [
  {
    label: 'Toronto, ON (Downtown YYZ)',
    country: 'CA',
    recipient: {
      name: 'Sarah Chen',
      company: 'Apex Designs Inc.',
      phone: '+1 416-555-0199',
      email: 'sarah.chen@example.ca',
      addressLine1: '250 Front St W',
      addressLine2: 'Suite 400',
      city: 'Toronto',
      stateOrProvince: 'ON',
      postalCode: 'M5V 2X4',
      countryCode: 'CA',
      buzzCode: '400',
      deliveryInstructions: 'Leave with front desk reception.',
    },
  },
  {
    label: 'Vancouver, BC (Richmond YVR)',
    country: 'CA',
    recipient: {
      name: 'Marcus Vance',
      company: 'Pacific Direct',
      phone: '+1 604-555-0122',
      email: 'm.vance@example.ca',
      addressLine1: '1055 W Georgia St',
      city: 'Vancouver',
      stateOrProvince: 'BC',
      postalCode: 'V6E 3P3',
      countryCode: 'CA',
      deliveryInstructions: 'Porch drop-off is okay.',
    },
  },
  {
    label: 'Montreal, QC (Saint-Laurent YUL)',
    country: 'CA',
    recipient: {
      name: 'Jean-Luc Tremblay',
      company: '',
      phone: '+1 514-555-0188',
      email: 'jl.tremblay@example.qc.ca',
      addressLine1: '1000 Rue de la Gauchetière O',
      city: 'Montreal',
      stateOrProvince: 'QC',
      postalCode: 'H3B 4W5',
      countryCode: 'CA',
      deliveryInstructions: 'Sonnez au 3B.',
    },
  },
  {
    label: 'Los Angeles, CA (LAX Hub)',
    country: 'US',
    recipient: {
      name: 'Chloe Rodriguez',
      company: 'Sunset Studio',
      phone: '+1 310-555-0177',
      email: 'chloe.r@example.com',
      addressLine1: '10250 Santa Monica Blvd',
      city: 'Los Angeles',
      stateOrProvince: 'CA',
      postalCode: '90067',
      countryCode: 'US',
      deliveryInstructions: 'Deliver to package locker room.',
    },
  },
  {
    label: 'New York, NY (JFK Hub)',
    country: 'US',
    recipient: {
      name: 'David Miller',
      company: '',
      phone: '+1 212-555-0144',
      email: 'd.miller@example.com',
      addressLine1: '350 5th Ave',
      addressLine2: 'Apt 12F',
      city: 'New York',
      stateOrProvince: 'NY',
      postalCode: '10118',
      countryCode: 'US',
      buzzCode: '12F',
    },
  },
];

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'package' | 'items'>('details');
  const [orderNumber, setOrderNumber] = useState(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [serviceType, setServiceType] = useState<'UNI_STANDARD' | 'UNI_PRIORITY' | 'UNI_CROSSBORDER_EXPEDITE'>('UNI_STANDARD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sender State
  const [sender, setSender] = useState<Address>({
    name: 'Warehouse Logistics Fulfillment',
    company: 'Apex Supply Co.',
    phone: '+1 905-555-0188',
    email: 'fulfillment@apexsupply.ca',
    addressLine1: '6850 Invader Crescent',
    city: 'Mississauga',
    stateOrProvince: 'ON',
    postalCode: 'L5T 2B7',
    countryCode: 'CA',
  });

  // Recipient State
  const [recipient, setRecipient] = useState<Address>(PRESET_ADDRESSES[0].recipient);

  // Package State
  const [pkg, setPkg] = useState<ParcelDetails>({
    weight: 1.25,
    weightUnit: 'kg',
    dimensions: { length: 25, width: 18, height: 8, unit: 'cm' },
    packagingType: 'box_small',
    signatureRequired: false,
    insuranceValue: 0,
  });

  // Line items State
  const [lineItems, setLineItems] = useState<ShipmentLineItem[]>([
    {
      sku: 'SKU-MERCH-01',
      description: 'Active Lifestyle Water Bottle & Pouch',
      quantity: 1,
      unitPrice: 29.99,
      currency: 'CAD',
      hsCode: '3924.10.4000',
      countryOfOrigin: 'CA',
    },
  ]);

  if (!isOpen) return null;

  // Real-time Sort Code Preview
  const sortInfo = getUniUniSortCode(recipient.postalCode, recipient.countryCode);

  // Real-time Rate Preview
  const rateOptions = calculateUniUniRates({
    originPostal: sender.postalCode,
    originCountry: sender.countryCode,
    destPostal: recipient.postalCode,
    destCountry: recipient.countryCode,
    weight: pkg.weight,
    weightUnit: pkg.weightUnit,
    length: pkg.dimensions.length,
    width: pkg.dimensions.width,
    height: pkg.dimensions.height,
    dimUnit: pkg.dimensions.unit,
    signatureRequired: pkg.signatureRequired,
    insuranceValue: pkg.insuranceValue,
  });

  const selectedRate = rateOptions.find((r) => r.serviceCode === serviceType) || rateOptions[0];

  const handleApplyPreset = (index: number) => {
    const preset = PRESET_ADDRESSES[index];
    setRecipient(preset.recipient);
  };

  const handlePackagingPresetChange = (type: 'polybag' | 'box_small' | 'box_medium' | 'box_large' | 'custom') => {
    if (type === 'polybag') {
      setPkg({ ...pkg, packagingType: type, weight: 0.4, dimensions: { length: 20, width: 15, height: 3, unit: 'cm' } });
    } else if (type === 'box_small') {
      setPkg({ ...pkg, packagingType: type, weight: 1.0, dimensions: { length: 25, width: 18, height: 8, unit: 'cm' } });
    } else if (type === 'box_medium') {
      setPkg({ ...pkg, packagingType: type, weight: 2.5, dimensions: { length: 35, width: 25, height: 15, unit: 'cm' } });
    } else if (type === 'box_large') {
      setPkg({ ...pkg, packagingType: type, weight: 4.5, dimensions: { length: 45, width: 35, height: 25, unit: 'cm' } });
    } else {
      setPkg({ ...pkg, packagingType: 'custom' });
    }
  };

  const handleCreate = async (autoPurchase: boolean = false) => {
    if (!recipient.name || !recipient.addressLine1 || !recipient.postalCode || !recipient.city) {
      alert('Please fill out all required recipient address fields (Name, Address, City, Postal Code).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/uniuni/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          serviceType,
          sender,
          recipient,
          package: pkg,
          shipmentLineItems: lineItems,
          rate: selectedRate ? selectedRate.cost : 5.85,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (autoPurchase && data.shipment?.id) {
          await fetch(`/api/uniuni/shipments/${data.shipment.id}/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        }

        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });

        onCreated();
        onClose();
      } else {
        alert(data.message || 'Failed to create shipment');
      }
    } catch (err: any) {
      alert('Error creating shipment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Create UniUni Shipment</h2>
              <p className="text-xs text-slate-400">
                POST /client/shipments/create • Automatic sort code and routing calculation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            1. Addresses & Routing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('package')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'package'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            2. Package & Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'items'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            3. Customs & Line Items
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: ADDRESSES & ROUTING */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Preset selector */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Quick Destination Presets (Canada & US Metros)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ADDRESSES.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(idx)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition font-medium flex items-center gap-1.5 ${
                        recipient.postalCode === preset.recipient.postalCode
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-slate-200">
                        {preset.country}
                      </span>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Reference Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Merchant Order Reference ID *
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. ORD-9401"
                  />
                </div>

                {/* Live Sort Code Preview Card */}
                <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between border border-slate-800">
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      Auto-Calculated Sort Code
                    </div>
                    <div className="text-xl font-mono font-black">{sortInfo.fullSortCode}</div>
                    <div className="text-[10px] text-slate-400">
                      {sortInfo.hubName} • {sortInfo.metroArea}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Airport: {sortInfo.airportCode}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">Zone: {sortInfo.area}</div>
                  </div>
                </div>
              </div>

              {/* Recipient & Sender Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipient Details */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      Recipient (Ship To)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                        placeholder="Sarah Chen"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Phone Number *</label>
                      <input
                        type="text"
                        value={recipient.phone}
                        onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                        placeholder="+1 416-555-0199"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={recipient.email || ''}
                        onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                        placeholder="sarah@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Company (Optional)</label>
                      <input
                        type="text"
                        value={recipient.company || ''}
                        onChange={(e) => setRecipient({ ...recipient, company: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                        placeholder="Apex Studio"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Address Line 1 (Street Address) *</label>
                    <input
                      type="text"
                      value={recipient.addressLine1}
                      onChange={(e) => setRecipient({ ...recipient, addressLine1: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                      placeholder="250 Front St W"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Address Line 2 (Unit / Suite / Apt)</label>
                    <input
                      type="text"
                      value={recipient.addressLine2 || ''}
                      onChange={(e) => setRecipient({ ...recipient, addressLine2: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                      placeholder="Suite 400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">City *</label>
                      <input
                        type="text"
                        value={recipient.city}
                        onChange={(e) => setRecipient({ ...recipient, city: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                        placeholder="Toronto"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Province/State *</label>
                      <input
                        type="text"
                        value={recipient.stateOrProvince}
                        onChange={(e) => setRecipient({ ...recipient, stateOrProvince: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                        placeholder="ON"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Postal / ZIP *</label>
                      <input
                        type="text"
                        value={recipient.postalCode}
                        onChange={(e) => setRecipient({ ...recipient, postalCode: e.target.value.toUpperCase() })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold"
                        placeholder="M5V 2X4"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">Country</label>
                      <select
                        value={recipient.countryCode}
                        onChange={(e) => setRecipient({ ...recipient, countryCode: e.target.value as CountryCode })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-semibold"
                      >
                        <option value="CA">Canada (CA)</option>
                        <option value="US">United States (US)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Buzz Code / Gate</label>
                      <input
                        type="text"
                        value={recipient.buzzCode || ''}
                        onChange={(e) => setRecipient({ ...recipient, buzzCode: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                        placeholder="e.g. 400 or #1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Driver Delivery Instructions</label>
                    <input
                      type="text"
                      value={recipient.deliveryInstructions || ''}
                      onChange={(e) => setRecipient({ ...recipient, deliveryInstructions: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                      placeholder="e.g. Leave with front concierge"
                    />
                  </div>
                </div>

                {/* Sender Details */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-600" />
                      Sender (Return Origin)
                    </span>
                    <span className="text-[10px] text-slate-500">Warehouse Origin</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={sender.name}
                        onChange={(e) => setSender({ ...sender, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Company</label>
                      <input
                        type="text"
                        value={sender.company || ''}
                        onChange={(e) => setSender({ ...sender, company: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={sender.addressLine1}
                      onChange={(e) => setSender({ ...sender, addressLine1: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        value={sender.city}
                        onChange={(e) => setSender({ ...sender, city: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Province/State</label>
                      <input
                        type="text"
                        value={sender.stateOrProvince}
                        onChange={(e) => setSender({ ...sender, stateOrProvince: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Postal / ZIP</label>
                      <input
                        type="text"
                        value={sender.postalCode}
                        onChange={(e) => setSender({ ...sender, postalCode: e.target.value.toUpperCase() })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-700 font-semibold mb-1">UniUni Last-Mile Advantage</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      UniUni delivers packages with local dedicated gig couriers, with 100% front-door photo Proof of Delivery across GTA, Greater Vancouver, Montreal, Calgary, and US metros.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGE & SERVICE LEVEL */}
          {activeTab === 'package' && (
            <div className="space-y-6">
              {/* Packaging presets */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Package Presets & Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'polybag', name: 'Polybag / Flyer', weight: '0.4 kg', dims: '20x15x3 cm' },
                    { id: 'box_small', name: 'Small Box', weight: '1.0 kg', dims: '25x18x8 cm' },
                    { id: 'box_medium', name: 'Medium Box', weight: '2.5 kg', dims: '35x25x15 cm' },
                    { id: 'box_large', name: 'Large Box', weight: '4.5 kg', dims: '45x35x25 cm' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePackagingPresetChange(preset.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        pkg.packagingType === preset.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{preset.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{preset.dims}</div>
                      <div className="text-[10px] font-mono text-emerald-700 mt-1">{preset.weight}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Dimensions and Weight */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
                <div className="font-bold text-slate-900 text-sm">Package Weight & Dimensions</div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Weight *</label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.01"
                        value={pkg.weight}
                        onChange={(e) => setPkg({ ...pkg, weight: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-l border border-slate-300 font-mono font-bold"
                      />
                      <select
                        value={pkg.weightUnit}
                        onChange={(e) => setPkg({ ...pkg, weightUnit: e.target.value as any })}
                        className="bg-slate-100 border border-l-0 border-slate-300 px-2 rounded-r font-mono"
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Length</label>
                    <input
                      type="number"
                      value={pkg.dimensions.length}
                      onChange={(e) =>
                        setPkg({
                          ...pkg,
                          dimensions: { ...pkg.dimensions, length: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Width</label>
                    <input
                      type="number"
                      value={pkg.dimensions.width}
                      onChange={(e) =>
                        setPkg({
                          ...pkg,
                          dimensions: { ...pkg.dimensions, width: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Height ({pkg.dimensions.unit})</label>
                    <input
                      type="number"
                      value={pkg.dimensions.height}
                      onChange={(e) =>
                        setPkg({
                          ...pkg,
                          dimensions: { ...pkg.dimensions, height: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkg.signatureRequired}
                      onChange={(e) => setPkg({ ...pkg, signatureRequired: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 font-medium">Signature Required upon delivery (+$1.75)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-slate-700 font-medium">Insurance Declared Value: $</span>
                    <input
                      type="number"
                      value={pkg.insuranceValue || 0}
                      onChange={(e) => setPkg({ ...pkg, insuranceValue: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-0.5 rounded border border-slate-300 font-mono"
                    />
                  </label>
                </div>
              </div>

              {/* Service Level Selection */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select UniUni Service Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {rateOptions.map((rate) => (
                    <button
                      key={rate.serviceCode}
                      type="button"
                      onClick={() => setServiceType(rate.serviceCode)}
                      className={`p-4 rounded-xl border text-left transition relative ${
                        serviceType === rate.serviceCode
                          ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {serviceType === rate.serviceCode && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="font-bold text-xs text-slate-900">{rate.serviceName}</div>
                      <div className="text-lg font-black text-emerald-700 font-mono my-1">
                        ${rate.cost.toFixed(2)} <span className="text-xs font-normal text-slate-600">{rate.currency}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{rate.estimatedDays}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Billable wt: {rate.billableWeight} kg
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMS & LINE ITEMS */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Shipment Line Items & Cross-Border Customs</div>
                  <p className="text-slate-500 text-[11px]">
                    Required by UniUni for manifests and CA ↔ US Section 321 customs clearance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLineItems([
                      ...lineItems,
                      {
                        sku: `SKU-${Date.now().toString().slice(-4)}`,
                        description: 'New Merchandise Item',
                        quantity: 1,
                        unitPrice: 15.0,
                        currency: 'CAD',
                        countryOfOrigin: 'CA',
                      },
                    ])
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 w-16">Qty</th>
                      <th className="p-2.5 w-24">Price</th>
                      <th className="p-2.5 w-28">HS Code</th>
                      <th className="p-2.5 w-16">Origin</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => {
                              const copy = [...lineItems];
                              copy[index].sku = e.target.value;
                              setLineItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const copy = [...lineItems];
                              copy[index].description = e.target.value;
                              setLineItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const copy = [...lineItems];
                              copy[index].quantity = parseInt(e.target.value) || 1;
                              setLineItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-center font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const copy = [...lineItems];
                              copy[index].unitPrice = parseFloat(e.target.value) || 0;
                              setLineItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.hsCode || ''}
                            onChange={(e) => {
                              const copy = [...lineItems];
                              copy[index].hsCode = e.target.value;
                              setLineItems(copy);
                            }}
                            placeholder="8518.30"
                            className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.countryOfOrigin || 'CA'}
                            onChange={(e) => {
                              const copy = [...lineItems];
                              copy[index].countryOfOrigin = e.target.value.toUpperCase();
                              setLineItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-center font-mono"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cross-border compliance card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-[11px] text-emerald-950">
                  <span className="font-bold">US Section 321 De Minimis Ready:</span> Shipments valued under $800 USD qualify for duty-free entry into the United States when shipped via UniUni cross-border linehaul.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Estimated Total:</span>
            <span className="text-base font-black text-slate-900 font-mono">
              ${selectedRate?.cost.toFixed(2)} {selectedRate?.currency}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCreate(false)}
              className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-medium text-xs transition"
            >
              Save as DRAFT
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCreate(true)}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              {isSubmitting ? 'Processing...' : 'Create & Purchase Label'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
