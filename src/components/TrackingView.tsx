import React, { useState, useEffect } from 'react';
import { Shipment, ScanEvent, UniUniConfig } from '../types/uniuni';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ShieldCheck,
  Calendar,
  Box,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Code2,
  Key,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';

interface TrackingViewProps {
  initialTrackingNumber?: string;
  onAdvanceMilestone?: (shipmentId: string, nextStatus: string) => void;
  shipments: Shipment[];
  config?: UniUniConfig;
  onOpenCredentials?: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  initialTrackingNumber,
  onAdvanceMilestone,
  shipments,
  config,
  onOpenCredentials,
}) => {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [activeTracking, setActiveTracking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiInspector, setShowApiInspector] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [lastApiLatency, setLastApiLatency] = useState(42);

  const sampleTrackingNumbers = [
    { number: 'UNI904817294819203', label: 'Out for Delivery (Toronto)', desc: 'Active Van' },
    { number: 'UNI904817294819204', label: 'Delivered (Vancouver + POD)', desc: 'Photo Verified' },
    { number: 'UNI904817294819205', label: 'In Transit (Montreal YUL)', desc: 'Sorted' },
    { number: 'UUS804918294819205', label: 'US Cross-Border (Los Angeles)', desc: 'LAX Hub' },
  ];

  useEffect(() => {
    if (initialTrackingNumber) {
      setTrackingNumber(initialTrackingNumber);
      handleLookup(initialTrackingNumber);
    } else if (shipments.length > 0) {
      // Pick first active shipment
      setTrackingNumber(shipments[0].trackingNumber);
      handleLookup(shipments[0].trackingNumber);
    } else {
      setTrackingNumber('UNI904817294819203');
      handleLookup('UNI904817294819203');
    }
  }, [initialTrackingNumber, shipments]);

  const handleLookup = async (idToQuery?: string) => {
    const id = (idToQuery || trackingNumber).trim();
    if (!id) return;

    setIsLoading(true);
    setError(null);
    const start = Date.now();

    try {
      const res = await fetch(`/api/uniuni/tracking/${encodeURIComponent(id)}`);
      const data = await res.json();
      setLastApiLatency(Date.now() - start || 38);
      if (data.success && data.data) {
        setActiveTracking(data.data);
      } else {
        setError('Tracking number not found or invalid format.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to query tracking.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateNextMilestone = (nextStatus: string) => {
    if (!activeTracking) return;
    const shipmentMatch = shipments.find((s) => s.trackingNumber === activeTracking.trackingNumber);
    if (shipmentMatch && onAdvanceMilestone) {
      onAdvanceMilestone(shipmentMatch.id, nextStatus);
      setTimeout(() => handleLookup(activeTracking.trackingNumber), 300);
    } else {
      // Local simulated progression
      const updatedEvents = [
        {
          timestamp: new Date().toISOString(),
          status: nextStatus,
          statusText: `Milestone advanced to ${nextStatus.replace(/_/g, ' ')}`,
          location: `${activeTracking.destinationAirport || 'YYZ'} Regional Hub`,
          facilityCode: `${activeTracking.destinationAirport || 'YYZ'}-STA`,
        },
        ...(activeTracking.events || []),
      ];

      setActiveTracking({
        ...activeTracking,
        status: nextStatus,
        events: updatedEvents,
        proofOfDelivery:
          nextStatus === 'DELIVERED'
            ? {
                deliveredAt: new Date().toISOString(),
                recipientName: activeTracking.recipient?.name || 'Front Porch',
                locationDescription: 'Front door porch (Contactless drop-off)',
                photoUrl:
                  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
              }
            : activeTracking.proofOfDelivery,
      });
    }
  };

  const getMilestoneIndex = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 0;
      case 'PURCHASED':
        return 1;
      case 'RECEIVED_AT_FACILITY':
        return 2;
      case 'IN_TRANSIT':
        return 3;
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 2;
    }
  };

  const milestones = [
    { key: 'DRAFT', label: 'Order Created', desc: 'Electronic info received' },
    { key: 'PURCHASED', label: 'Label Ready', desc: 'Induction ready' },
    { key: 'RECEIVED_AT_FACILITY', label: 'Gateway Ingested', desc: 'Weighed & scanned' },
    { key: 'IN_TRANSIT', label: 'Hub Sorted', desc: 'Linehaul container' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'With Uni courier' },
    { key: 'DELIVERED', label: 'Delivered (POD)', desc: 'Photo proof' },
  ];

  const currentStep = activeTracking ? getMilestoneIndex(activeTracking.status) : 0;

  const currentEndpointUrl = `https://api-sandbox.ship.uniuni.com/client/order/tracking?tracking_number=${
    activeTracking?.trackingNumber || trackingNumber || 'UNI904817294819203'
  }`;

  const currentCurl = `curl -X GET "${currentEndpointUrl}" \\
  -H "Authorization: Bearer ${config?.accessToken || 'uni_sandbox_test_token_88192'}" \\
  -H "Accept: application/json"`;

  const handleCopyJson = () => {
    if (activeTracking) {
      navigator.clipboard.writeText(JSON.stringify(activeTracking, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(currentCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Friendly Tester Key Helper Banner */}
      <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 border border-emerald-500/30">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                API Test Environment Active
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {config?.environment || 'sandbox_global'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Testing mode ready! Use our pre-configured sandbox keys or input your own <code className="text-emerald-300 font-mono text-[11px]">UNIUNI_CLIENT_ID</code> & <code className="text-emerald-300 font-mono text-[11px]">SECRET</code>.
            </p>
          </div>
        </div>

        {onOpenCredentials && (
          <button
            type="button"
            onClick={onOpenCredentials}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
          >
            <Key className="w-3.5 h-3.5" />
            Manage Test Keys
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter 19-digit UniUni Tracking # (e.g. UNI904817294819203 or UUS804918294819205)"
              className="w-full text-xs font-mono pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Track Parcel
          </button>
        </form>

        {/* Quick Sample Key Chips */}
        <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-slate-100 overflow-x-auto text-xs">
          <span className="text-slate-500 text-[11px] font-medium shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Quick Test Parcels:
          </span>
          {sampleTrackingNumbers.map((s) => (
            <button
              key={s.number}
              type="button"
              onClick={() => {
                setTrackingNumber(s.number);
                handleLookup(s.number);
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-mono shrink-0 transition flex items-center gap-1.5 ${
                trackingNumber === s.number
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{s.number.slice(0, 7)}...</span>
              <span className="text-[10px] text-slate-400">({s.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-500" />
          {error}
        </div>
      )}

      {activeTracking && (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xl font-black text-slate-900">
                    {activeTracking.trackingNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white font-mono">
                    {activeTracking.sortCode || 'YYZ-A 021'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Live Verified
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Order Ref: <strong className="text-slate-700">{activeTracking.orderNumber}</strong></span>
                  <span>•</span>
                  <span>Hub Airport: <strong className="text-slate-700">{activeTracking.destinationAirport}</strong></span>
                  <span>•</span>
                  <span>Destination: <strong className="text-slate-700">{activeTracking.recipient?.city}, {activeTracking.recipient?.state} {activeTracking.recipient?.postalCode}</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start lg:items-center gap-3">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Current Status
                  </span>
                  <span className="inline-flex items-center text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mt-0.5">
                    <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
                    {activeTracking.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Quick Simulation Buttons for Testers */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] font-semibold text-slate-500 px-1.5">Simulate:</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateNextMilestone('OUT_FOR_DELIVERY')}
                    className="px-2 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition"
                  >
                    Out for Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateNextMilestone('DELIVERED')}
                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Deliver + POD
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {milestones.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative">
                      {/* Circle icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="font-bold text-[11px] text-slate-900 mt-2">{step.label}</div>
                      <div className="text-[10px] text-slate-400">{step.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Collapsible API Request & Response Inspector for Developers */}
          <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowApiInspector(!showApiInspector)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/60 transition"
            >
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white">
                  Developer API Inspector: <code className="text-emerald-400 font-mono">/client/order/tracking</code>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  HTTP 200 OK • {lastApiLatency}ms
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{showApiInspector ? 'Hide API Payload' : 'Inspect Request & Raw JSON'}</span>
                {showApiInspector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showApiInspector && (
              <div className="p-5 border-t border-slate-800 space-y-4 text-xs font-mono">
                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-slate-400 font-sans text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
                      <span>HTTP Request Details</span>
                      <button
                        type="button"
                        onClick={handleCopyCurl}
                        className="text-emerald-400 hover:text-emerald-300 font-sans text-[11px] flex items-center gap-1"
                      >
                        {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedCurl ? 'Copied cURL' : 'Copy cURL'}
                      </button>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 text-[11px] space-y-1">
                      <div><span className="text-emerald-400 font-bold">GET</span> {currentEndpointUrl}</div>
                      <div className="text-slate-500">Authorization: Bearer {config?.accessToken ? `${config.accessToken.slice(0, 18)}...` : 'uni_sandbox_test_token_88192'}</div>
                      <div className="text-slate-500">Accept: application/json</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-slate-400 font-sans text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
                      <span>HTTP Response JSON Payload</span>
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="text-emerald-400 hover:text-emerald-300 font-sans text-[11px] flex items-center gap-1"
                      >
                        {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedJson ? 'Copied JSON' : 'Copy JSON'}
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-300 text-[11px] max-h-48 overflow-y-auto">
                      <code>{JSON.stringify(activeTracking, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Grid: Scan Events Timeline & Proof of Delivery (POD) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scan Events Timeline (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Real-Time Scan History & Courier Checkpoints
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeTracking.events?.length || 0} scan events
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activeTracking.events?.map((ev: ScanEvent, i: number) => (
                  <div key={i} className="relative group">
                    {/* Timeline node */}
                    <div
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                        i === 0
                          ? 'border-emerald-600 bg-emerald-600 ring-4 ring-emerald-100'
                          : 'border-slate-400'
                      }`}
                    ></div>

                    <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900">
                          {ev.statusText || ev.status}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(ev.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.location}</span>
                        {ev.facilityCode && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                            {ev.facilityCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof of Delivery (POD) & Recipient Card */}
            <div className="space-y-6">
              {/* Proof of Delivery Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-3">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Proof of Delivery (POD)
                </div>

                {activeTracking.proofOfDelivery ? (
                  <div className="space-y-3">
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                      <img
                        src={activeTracking.proofOfDelivery.photoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'}
                        alt="Proof of Delivery Photo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                        Driver Front-Door Photo Verified
                      </div>
                    </div>

                    <div className="text-xs space-y-1 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-950">
                      <div>
                        <strong>Recipient:</strong> {activeTracking.proofOfDelivery.recipientName || 'Front Door Porch'}
                      </div>
                      <div>
                        <strong>Delivered At:</strong>{' '}
                        {new Date(activeTracking.proofOfDelivery.deliveredAt).toLocaleString()}
                      </div>
                      <div>
                        <strong>Location Note:</strong> {activeTracking.proofOfDelivery.locationDescription}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs">
                    <Camera className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                    POD Photo will be captured upon courier delivery completion.
                  </div>
                )}
              </div>

              {/* Destination Address details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-xs space-y-2">
                <div className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  Delivery Destination
                </div>
                <div className="font-semibold text-slate-900">{activeTracking.recipient?.name}</div>
                <div className="text-slate-600">
                  {activeTracking.recipient?.city}, {activeTracking.recipient?.state}{' '}
                  <span className="font-mono font-bold">{activeTracking.recipient?.postalCode}</span>
                </div>
                <div className="text-slate-500 font-medium">Country: {activeTracking.recipient?.country}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
