import React, { useState, useEffect } from 'react';
import { WebhookEventRecord, Shipment } from '../types/uniuni';
import {
  Webhook,
  Play,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface WebhookViewProps {
  shipments: Shipment[];
}

export const WebhookView: React.FC<WebhookViewProps> = ({ shipments }) => {
  const [targetUrl, setTargetUrl] = useState('https://merchant-store.com/api/webhooks/uniuni');
  const [secretKey, setSecretKey] = useState('uni_whsec_908412948102938471');
  const [eventType, setEventType] = useState('tracking.status_updated');
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id || '');
  const [isFiring, setIsFiring] = useState(false);
  const [logs, setLogs] = useState<WebhookEventRecord[]>([]);
  const [activeLog, setActiveLog] = useState<WebhookEventRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/uniuni/webhooks/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
        if (!activeLog && data.logs.length > 0) {
          setActiveLog(data.logs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch webhook logs:', err);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsFiring(true);
    try {
      const res = await fetch('/api/uniuni/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          targetUrl,
          secretKey,
          shipmentId: selectedShipmentId,
        }),
      });

      const data = await res.json();
      if (data.success && data.log) {
        setLogs([data.log, ...logs]);
        setActiveLog(data.log);
      }
    } catch (err: any) {
      alert('Error triggering webhook: ' + err.message);
    } finally {
      setIsFiring(false);
    }
  };

  const handleCopyPayload = () => {
    if (activeLog) {
      navigator.clipboard.writeText(JSON.stringify(activeLog.payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const eventTypes = [
    { id: 'tracking.status_updated', name: 'tracking.status_updated (In Transit / Hub Scan)' },
    { id: 'shipment.purchased', name: 'shipment.purchased (Label Activated)' },
    { id: 'shipment.out_for_delivery', name: 'shipment.out_for_delivery (Driver En Route)' },
    { id: 'shipment.delivered', name: 'shipment.delivered (Proof of Delivery Photo)' },
    { id: 'shipment.exception', name: 'shipment.exception (Delivery Failed / Retry)' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
            UniUni Webhook Simulator & Event Stream
          </div>
          <h2 className="text-xl font-bold">Real-Time Webhook Testing & Security Studio</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Simulate real-time parcel transit event callbacks with HMAC-SHA256 payload verification (<code className="text-emerald-300 font-mono">X-UniUni-Signature</code>).
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono text-xs shrink-0">
          <div className="text-slate-400 text-[10px]">SIGNATURE STANDARD:</div>
          <div className="text-emerald-400 font-bold text-sm">HMAC-SHA256 (payload, secret)</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Header: X-UniUni-Signature</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Webhook Configuration & Dispatcher (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Webhook className="w-4 h-4 text-emerald-600" />
            Webhook Simulation Dispatcher
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Destination Webhook URL
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              placeholder="https://your-domain.com/api/webhooks/uniuni"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Webhook Signing Secret (HMAC SHA-256)
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
            >
              {eventTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>

          {shipments.length > 0 && (
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Shipment
              </label>
              <select
                value={selectedShipmentId}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              >
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.trackingNumber} — {s.recipient.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSimulateWebhook}
              disabled={isFiring}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isFiring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isFiring ? 'Dispatching...' : 'Dispatch Simulated Webhook Event'}
            </button>
          </div>

          {/* Node.js verification code helper */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Express HMAC Verification Example
            </div>
            <pre className="text-[10px] font-mono text-slate-700 overflow-x-auto p-1 bg-white border border-slate-200 rounded">
{`const sig = req.headers['x-uniuni-signature'];
const expected = 'sha256=' + crypto
  .createHmac('sha256', SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
if (sig === expected) { /* Verified */ }`}
            </pre>
          </div>
        </div>

        {/* Webhook Delivery Logs & Payload Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-900">Dispatched Event History</span>
              <button
                onClick={fetchLogs}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No webhook events dispatched yet. Click "Dispatch" to fire your first event.
                </div>
              ) : (
                logs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setActiveLog(log)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${
                      activeLog?.id === log.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold font-mono text-xs">{log.event}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()} • {log.targetUrl}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {log.httpResponseCode || 200} OK
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{log.durationMs}ms</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Active Payload Detail */}
          {activeLog && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-900">Event Payload: {activeLog.event}</span>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Signature: <code className="text-slate-800 font-bold truncate">{activeLog.signature}</code>
                  </div>
                </div>

                <button
                  onClick={handleCopyPayload}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>

              <pre className="w-full text-xs font-mono p-3 bg-slate-950 text-emerald-300 rounded-lg overflow-x-auto max-h-72">
                <code>{JSON.stringify(activeLog.payload, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
