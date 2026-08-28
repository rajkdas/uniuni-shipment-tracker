import React, { useState, useEffect } from 'react';
import { BatchManifest, Shipment } from '../types/uniuni';
import { Layers, Printer, Plus, CheckCircle2, Truck, FileText, Calendar, Box, User, X } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface BatchesViewProps {
  shipments: Shipment[];
}

export const BatchesView: React.FC<BatchesViewProps> = ({ shipments }) => {
  const [batches, setBatches] = useState<BatchManifest[]>([]);
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<BatchManifest | null>(null);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [driverName, setDriverName] = useState('Assigned Uni Courier');
  const [hubCode, setHubCode] = useState('YYZ-01 (Toronto Gateway)');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/uniuni/batches');
      const data = await res.json();
      if (data.success && data.batches) {
        setBatches(data.batches);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    }
  };

  const eligibleShipments = shipments.filter((s) => s.status === 'PURCHASED' || s.status === 'IN_TRANSIT');

  const handleCreateBatch = async () => {
    if (selectedShipmentIds.length === 0) {
      alert('Please select at least one shipment to include in the batch manifest.');
      return;
    }

    try {
      const res = await fetch('/api/uniuni/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentIds: selectedShipmentIds,
          hubCode,
          driverName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreatingModal(false);
        setSelectedShipmentIds([]);
        fetchBatches();
      }
    } catch (err: any) {
      alert('Failed to create batch: ' + err.message);
    }
  };

  const handlePrintManifest = (batch: BatchManifest) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const batchShipments = shipments.filter((s) => batch.shipmentIds.includes(s.id));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>UniUni Driver Pickup Manifest - ${batch.batchNumber}</title>
          <style>
            @page { size: letter; margin: 20mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; color: #0f172a; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: 900; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background: #0f172a; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 12px; }
            .sig-line { border-top: 1px solid #0f172a; padding-top: 6px; margin-top: 40px; }
          </style>
        </head>
        <body onload="window.print();">
          <div class="header">
            <div>
              <div class="title">UniUni Logistics Driver Pickup Manifest</div>
              <div style="font-size: 12px; color: #64748b;">Official End-of-Day Induction & Scan Sheet</div>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 14px; font-weight: bold;">
              ${batch.batchNumber}
            </div>
          </div>

          <div class="meta-grid">
            <div><strong>Created:</strong><br/>${new Date(batch.createdAt).toLocaleString()}</div>
            <div><strong>Total Parcels:</strong><br/>${batch.totalShipments} Items</div>
            <div><strong>Total Weight:</strong><br/>${batch.totalWeightKg} kg</div>
            <div><strong>Hub Gateway:</strong><br/>${batch.hubCode}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tracking Number</th>
                <th>Order Ref</th>
                <th>Recipient & City</th>
                <th>Sort Code</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              ${batchShipments
                .map(
                  (s, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td style="font-family: monospace; font-weight: bold;">${s.trackingNumber}</td>
                  <td>${s.orderNumber}</td>
                  <td>${s.recipient.name} (${s.recipient.city}, ${s.recipient.stateOrProvince})</td>
                  <td style="font-family: monospace; font-weight: bold;">${s.sortCode}</td>
                  <td>${s.package.weight} ${s.package.weightUnit}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div>
              <strong>Shipper / Warehouse Signoff:</strong>
              <div class="sig-line">Shipper Authorized Signature & Date</div>
            </div>
            <div>
              <strong>UniUni Driver Pickup Acceptance:</strong>
              <div class="sig-line">UniUni Driver Signature / ID #${batch.driverName}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Batch Manifests & Driver Pickup Sheets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Group purchased shipments into a daily batch for official driver scan pickup at your warehouse.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Batch Manifest
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              <th className="p-3.5">Batch Number</th>
              <th className="p-3.5">Created At</th>
              <th className="p-3.5">Parcels</th>
              <th className="p-3.5">Total Weight</th>
              <th className="p-3.5">Assigned Driver</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batches.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No driver pickup batches created yet. Click "Create New Batch Manifest" above to group your shipments.
                </td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{batch.batchNumber}</td>
                  <td className="p-3.5 text-slate-600">{new Date(batch.createdAt).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-slate-900">{batch.totalShipments} packages</td>
                  <td className="p-3.5 font-mono">{batch.totalWeightKg} kg</td>
                  <td className="p-3.5 text-slate-700">{batch.driverName || 'Uni Courier'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handlePrintManifest(batch)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-2xs transition inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Manifest Sheet
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal to Create Batch */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create Driver Pickup Batch</h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Destination Hub Gateway</label>
                  <input
                    type="text"
                    value={hubCode}
                    onChange={(e) => setHubCode(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned Driver ID / Route</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  Select Purchased Shipments for Pickup ({selectedShipmentIds.length} selected)
                </label>
                <div className="border border-slate-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {eligibleShipments.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      No purchased shipments available. Create and purchase shipments first.
                    </div>
                  ) : (
                    eligibleShipments.map((s) => (
                      <label
                        key={s.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedShipmentIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedShipmentIds([...selectedShipmentIds, s.id]);
                              } else {
                                setSelectedShipmentIds(selectedShipmentIds.filter((id) => id !== s.id));
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-mono font-bold text-slate-900">{s.trackingNumber}</div>
                            <div className="text-slate-500 text-[11px]">
                              {s.recipient.name} • {s.recipient.city} ({s.sortCode})
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-slate-700">
                          {s.package.weight} {s.package.weightUnit}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedShipmentIds(eligibleShipments.map((s) => s.id))}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                Select All Eligible ({eligibleShipments.length})
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBatch}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                >
                  Generate Manifest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
