import React, { useState } from 'react';
import { CountryCode, SortCodeInfo } from '../types/uniuni';
import { getUniUniSortCode } from '../utils/uniuniRouting';
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Sparkles,
  Plane,
  Building,
} from 'lucide-react';

export const SortCodeView: React.FC = () => {
  const [postalInput, setPostalInput] = useState('M5V 2T6');
  const [country, setCountry] = useState<CountryCode>('CA');
  const [bulkInput, setBulkInput] = useState(
    `M5V 2T6\nV6B 1A1\nH3Z 2Y7\nT2P 1J9\n90001\n10001\n98101\nL5A 2Y1\nK1P 5J2\n75001`
  );
  const [bulkResults, setBulkResults] = useState<SortCodeInfo[]>([]);
  const [copied, setCopied] = useState(false);

  // Single query result
  const singleResult = getUniUniSortCode(postalInput, country);

  const handleRunBulk = () => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const results = lines.map((code) => {
      // Auto detect country
      const isCanada = /^[A-Z]\d[A-Z]/i.test(code.replace(/\s+/g, ''));
      return getUniUniSortCode(code, isCanada ? 'CA' : 'US');
    });

    setBulkResults(results);
  };

  const handleExportCSV = () => {
    if (bulkResults.length === 0) return;
    const header = 'PostalCode,Country,IsCovered,SortCode,Airport,Zone,Route,HubName,MetroArea,TransitDays\n';
    const rows = bulkResults
      .map(
        (r) =>
          `"${r.postalCode}","${r.country}","${r.isCovered}","${r.fullSortCode}","${r.airportCode}","${r.area}","${r.routeNumber}","${r.hubName}","${r.metroArea}","${r.estimatedTransitDays}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uniuni-sort-codes-${Date.now()}.csv`;
    link.click();
  };

  const quickSamples = [
    { code: 'M5V 2X4', country: 'CA' as const, label: 'Toronto Downtown (YYZ-A)' },
    { code: 'V6B 1A1', country: 'CA' as const, label: 'Vancouver Downtown (YVR-A)' },
    { code: 'H3B 4W5', country: 'CA' as const, label: 'Montreal Central (YUL-A)' },
    { code: 'T2P 1J9', country: 'CA' as const, label: 'Calgary Commercial (YYC-A)' },
    { code: '90012', country: 'US' as const, label: 'Los Angeles (LAX-A)' },
    { code: '10118', country: 'US' as const, label: 'New York Queens/Manhattan (JFK-A)' },
    { code: '98101', country: 'US' as const, label: 'Seattle Downtown (SEA-A)' },
    { code: '60601', country: 'US' as const, label: 'Chicago Loop (ORD-A)' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
            UniUni Sort Code Specification
          </div>
          <h2 className="text-xl font-bold">Postal Code Routing & Hub Zone Matrix</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            UniUni uses high-speed conveyor sorting logic. The first 3 characters of Canadian postal codes (FSAs) or 5 digits of US ZIP codes map directly to destination airports, sorting zones (A-D), and driver route numbers. Format: <code className="text-emerald-300 font-mono font-bold">PORT-AREA ROUTE</code> (e.g. <code className="text-emerald-300 font-mono font-bold">YYZ-A 021</code>).
          </p>
        </div>

        <div className="shrink-0 bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono text-xs">
          <div className="text-slate-400 text-[10px] uppercase">Format Standard:</div>
          <div className="text-emerald-400 font-bold text-sm">port + '-' + area + ' ' + route</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Docs: GET /client/postal-code/sort-code</div>
        </div>
      </div>

      {/* Interactive Single Postal Code Lookup */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-600" />
          Single Postal / Zip Code Inspector
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter Canadian Postal Code or US ZIP Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={postalInput}
                onChange={(e) => setPostalInput(e.target.value.toUpperCase())}
                placeholder="e.g. M5V 2T6 or 90001"
                className="w-full text-sm font-mono font-bold px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as CountryCode)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-bold shrink-0"
              >
                <option value="CA">🇨🇦 Canada (CA)</option>
                <option value="US">🇺🇸 United States (US)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quick Test Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickSamples.slice(0, 4).map((s) => (
                <button
                  key={s.code}
                  onClick={() => {
                    setPostalInput(s.code);
                    setCountry(s.country);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-medium transition"
                >
                  {s.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Routing Card */}
        {singleResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Primary Sort Block */}
              <div className="bg-slate-900 text-white p-4 rounded-xl text-center shadow-xs">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  UniUni Sort Code
                </div>
                <div className="text-2xl font-black font-mono mt-1 text-emerald-300">
                  {singleResult.fullSortCode}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Route: {singleResult.routeNumber}
                </div>
              </div>

              {/* Airport & Hub */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-slate-400" />
                  Destination Airport Hub
                </div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {singleResult.airportCode}{' '}
                  <span className="text-xs font-semibold text-slate-500">({singleResult.hubName})</span>
                </div>
                <div className="text-slate-600">{singleResult.metroArea}</div>
              </div>

              {/* Coverage & Zone */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Sorting Zone & Coverage
                </div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Zone {singleResult.area} • Direct Delivery
                </div>
                <div className="text-slate-600">Transit SLA: ~{singleResult.estimatedTransitDays} Business Day(s)</div>
              </div>

              {/* Label Code integration snippet */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-[11px] space-y-1 font-mono text-slate-700">
                <div className="text-slate-500 font-sans font-semibold text-[10px] uppercase">
                  Label Integration Snippet:
                </div>
                <div className="bg-slate-100 p-1.5 rounded text-[10px] break-all">
                  sort_code: "{singleResult.fullSortCode}"
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Ready for thermal print template inclusion.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk CSV Batch Address / Postal Code Validator */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Bulk Postal Code & Address Matrix Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Paste a list of Canadian & US postal codes to resolve all sorting codes and hubs in bulk.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunBulk}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Resolve All Codes
            </button>

            {bulkResults.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={4}
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder="Paste postal codes one per line (e.g. M5V 2T6, V6B 1A1, 90001)..."
          className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        ></textarea>

        {bulkResults.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Postal / ZIP</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Sort Code</th>
                  <th className="p-3">Airport</th>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Regional Hub</th>
                  <th className="p-3">Transit SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bulkResults.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{r.postalCode}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.country}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-900 text-emerald-400">
                        {r.fullSortCode}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{r.airportCode}</td>
                    <td className="p-3 font-bold text-slate-700">{r.area}</td>
                    <td className="p-3 text-slate-600">{r.hubName}</td>
                    <td className="p-3 text-slate-600 font-medium">~{r.estimatedTransitDays} Day(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
