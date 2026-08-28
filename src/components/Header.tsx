import React, { useState } from 'react';
import { UniUniConfig } from '../types/uniuni';
import { getUniUniSortCode } from '../utils/uniuniRouting';
import {
  Package,
  Truck,
  MapPin,
  Calculator,
  Code2,
  Layers,
  Webhook,
  Key,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: UniUniConfig;
  onOpenCredentials: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  config,
  onOpenCredentials,
}) => {
  const [quickPostal, setQuickPostal] = useState('');
  const [quickResult, setQuickResult] = useState<any | null>(null);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostal.trim()) return;
    const res = getUniUniSortCode(quickPostal);
    setQuickResult(res);
  };

  const navTabs = [
    { id: 'tracking', label: 'Parcel Tracking & POD', icon: Truck },
    { id: 'shipments', label: 'Shipments & Labels', icon: Package },
    { id: 'sort-codes', label: 'Sort Codes & Routing', icon: MapPin },
    { id: 'rates', label: 'Rate Quoting', icon: Calculator },
    { id: 'explorer', label: 'API Request Runner', icon: Code2 },
    { id: 'batches', label: 'Batch Manifests', icon: Layers },
    { id: 'webhooks', label: 'Webhook Studio', icon: Webhook },
  ];

  const getEnvBadge = () => {
    switch (config.environment) {
      case 'prod_global':
        return { label: 'Global Live (api.ship.uniuni.com)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'ca_prod':
        return { label: 'Canada Live (sj.uniexpress.ca)', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'us_prod':
        return { label: 'US Live (prm-api.uniuni.com)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'ca_qa':
        return { label: 'Canada QA (sjqa.uniexpress.org)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'us_qa':
        return { label: 'US QA (prm-api.qa.uniuni.com)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      default:
        return { label: 'Sandbox (api-sandbox.ship.uniuni.com)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
  };

  const envBadge = getEnvBadge();

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center tracking-tighter shadow-sm">
            UNI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">UniUni Shipping API Hub</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Developer Console & Logistics Tool for Canada & US Last-Mile Delivery
            </p>
          </div>
        </div>

        {/* Quick Postal Sort Code Checker */}
        <form
          onSubmit={handleQuickCheck}
          className="hidden md:flex items-center relative text-xs"
        >
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={quickPostal}
              onChange={(e) => {
                setQuickPostal(e.target.value.toUpperCase());
                if (!e.target.value) setQuickResult(null);
              }}
              placeholder="Quick Sort Code (e.g. M5V 2T6)..."
              className="bg-slate-900 text-slate-100 placeholder-slate-500 text-xs font-mono pl-8 pr-16 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 w-56"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition"
            >
              Route
            </button>
          </div>

          {/* Quick Result Tooltip / Popover */}
          {quickResult && (
            <div className="absolute top-10 right-0 bg-slate-900 border border-slate-700 shadow-xl rounded-xl p-3 w-64 z-50 text-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {quickResult.fullSortCode}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {quickResult.airportCode}
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                {quickResult.hubName} • Zone {quickResult.area}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Transit SLA: ~{quickResult.estimatedTransitDays} business days
              </div>
            </div>
          )}
        </form>

        {/* Right Tools & Environment Toggle */}
        <div className="flex items-center gap-3">
          {/* Environment button */}
          <button
            onClick={onOpenCredentials}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${envBadge.color} hover:opacity-90`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="truncate max-w-[140px] sm:max-w-none">{envBadge.label}</span>
          </button>

          <a
            href="https://docs.uniuni.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5 font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">UniUni Docs</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto space-x-1 border-t border-slate-800/80 text-xs font-medium scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
