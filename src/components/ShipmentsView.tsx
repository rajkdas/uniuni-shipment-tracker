import React, { useState } from 'react';
import { Shipment, ShipmentStatus } from '../types/uniuni';
import {
  Package,
  Printer,
  Search,
  Plus,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  Trash2,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

interface ShipmentsViewProps {
  shipments: Shipment[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenLabel: (shipment: Shipment) => void;
  onOpenTracking: (trackingNumber: string) => void;
  onPurchase: (shipmentId: string) => void;
  onCancel: (shipmentId: string) => void;
  onAdvanceMilestone: (shipmentId: string, nextStatus: string) => void;
  onCreateBatch: (selectedIds: string[]) => void;
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  shipments,
  isLoading,
  onRefresh,
  onOpenCreate,
  onOpenLabel,
  onOpenTracking,
  onPurchase,
  onCancel,
  onAdvanceMilestone,
  onCreateBatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter shipments
  const filtered = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      s.orderNumber.toLowerCase().includes(q) ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.recipient.name.toLowerCase().includes(q) ||
      s.recipient.postalCode.toLowerCase().includes(q) ||
      s.sortCode.toLowerCase().includes(q) ||
      s.destinationAirport.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  const counts = {
    total: shipments.length,
    draft: shipments.filter((s) => s.status === 'DRAFT').length,
    purchased: shipments.filter((s) => s.status === 'PURCHASED').length,
    inTransit: shipments.filter((s) => ['IN_TRANSIT', 'RECEIVED_AT_FACILITY', 'OUT_FOR_DELIVERY'].includes(s.status)).length,
    delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            DRAFT
          </span>
        );
      case 'PURCHASED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            PURCHASED
          </span>
        );
      case 'RECEIVED_AT_FACILITY':
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3 h-3 mr-1" />
            IN TRANSIT
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3 mr-1" />
            OUT FOR DELIVERY
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            DELIVERED
          </span>
        );
      case 'CANCELLED':
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Shipments</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{counts.total}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Drafts (Pending)</div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{counts.draft}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Purchased Labels</div>
          <div className="text-2xl font-black text-blue-700 mt-1 font-mono">{counts.purchased}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">In Courier Transit</div>
          <div className="text-2xl font-black text-indigo-700 mt-1 font-mono">{counts.inTransit}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Delivered (POD)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{counts.delivered}</div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking #, Order ID, Recipient, Sort Code..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {['ALL', 'DRAFT', 'PURCHASED', 'IN_TRANSIT', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md transition ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => onCreateBatch(selectedIds)}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs transition"
            >
              <Layers className="w-3.5 h-3.5" />
              Create Batch Manifest ({selectedIds.length})
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenCreate}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Create Shipment
          </button>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3.5">Order / Tracking #</th>
                <th className="p-3.5">Recipient & Destination</th>
                <th className="p-3.5">Sort Code / Hub</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Package & Rate</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No shipments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(shipment.id)}
                        onChange={() => handleToggleRow(shipment.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 font-mono">{shipment.orderNumber}</div>
                      <div className="font-mono text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <span>{shipment.trackingNumber}</span>
                        <button
                          onClick={() => onOpenTracking(shipment.trackingNumber)}
                          className="text-emerald-600 hover:text-emerald-800 p-0.5"
                          title="Track Live"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{shipment.recipient.name}</div>
                      <div className="text-slate-500 text-[11px]">
                        {shipment.recipient.city}, {shipment.recipient.stateOrProvince}{' '}
                        <span className="font-mono font-semibold text-slate-700">
                          {shipment.recipient.postalCode}
                        </span>{' '}
                        ({shipment.recipient.countryCode})
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-900 text-white">
                        {shipment.sortCode || 'YYZ-A 021'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Airport: <span className="font-semibold">{shipment.destinationAirport}</span> (Zone{' '}
                        {shipment.sortingZone})
                      </div>
                    </td>
                    <td className="p-3.5">{getStatusBadge(shipment.status)}</td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">
                        ${shipment.rate.toFixed(2)} {shipment.currency}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {shipment.package.weight} {shipment.package.weightUnit} • {shipment.serviceType.replace('UNI_', '')}
                      </div>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {shipment.status === 'DRAFT' ? (
                        <button
                          onClick={() => onPurchase(shipment.id)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-2xs transition"
                        >
                          Purchase Label
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenLabel(shipment)}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium text-xs transition inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          4x6 Label
                        </button>
                      )}

                      <button
                        onClick={() => onOpenTracking(shipment.trackingNumber)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Track
                      </button>

                      {/* Milestone advancement shortcut for testing */}
                      {['PURCHASED', 'RECEIVED_AT_FACILITY', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(
                        shipment.status
                      ) && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) onAdvanceMilestone(shipment.id, e.target.value);
                          }}
                          defaultValue=""
                          className="text-[11px] py-1 px-1.5 rounded border border-slate-300 bg-white text-slate-600 font-medium"
                          title="Simulate Next Tracking Scan"
                        >
                          <option value="" disabled>
                            ⚡ Advance Status...
                          </option>
                          <option value="RECEIVED_AT_FACILITY">→ Facility Ingestion Scan</option>
                          <option value="IN_TRANSIT">→ Regional Hub Sort</option>
                          <option value="OUT_FOR_DELIVERY">→ Out for Delivery</option>
                          <option value="DELIVERED">→ Delivered (POD Photo)</option>
                        </select>
                      )}

                      {shipment.status !== 'CANCELLED' && shipment.status !== 'REFUNDED' && (
                        <button
                          onClick={() => onCancel(shipment.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Cancel / Void Shipment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
