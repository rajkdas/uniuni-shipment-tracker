import React, { useState } from 'react';
import { UniUniConfig, UniUniEnvironment } from '../types/uniuni';
import { Key, Globe, ShieldCheck, Copy, Check, ExternalLink, X, RefreshCw } from 'lucide-react';

interface CredentialsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  config: UniUniConfig;
  onSave?: (config: UniUniConfig) => void;
  onSaveConfig?: (config: UniUniConfig) => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen = true,
  onClose,
  config,
  onSave,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<UniUniConfig>(config);
  const [copied, setCopied] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (isOpen === false) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveConfig) onSaveConfig(formData);
    if (onSave) onSave(formData);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 600);
  };

  const loadDemoCredentials = () => {
    setFormData({
      environment: 'sandbox_global',
      accessToken: 'uni_demo_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sandbox_key_90281',
      clientId: 'uni_client_sandbox_881920',
      clientSecret: 'uni_sec_991823719284719284',
      customerNumber: 'UNICA90281',
      autoSimulateIfOffline: true,
    });
  };

  const clearCredentials = () => {
    setFormData({
      environment: 'sandbox_global',
      accessToken: '',
      clientId: '',
      clientSecret: '',
      customerNumber: '',
      autoSimulateIfOffline: true,
    });
  };

  const handleCopyToken = () => {
    if (formData.accessToken) {
      navigator.clipboard.writeText(formData.accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">UniUni API Credentials & Environment</h2>
              <p className="text-xs text-slate-400">Configure authentication tokens, Client ID, and endpoint environments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Quick presets */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-lg p-3.5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-950">
                <span className="font-semibold">Ready to test immediately?</span> Click below to populate sandbox credentials or use your live keys from <a href="https://docs.uniuni.com" target="_blank" rel="noreferrer" className="underline font-medium hover:text-emerald-800">docs.uniuni.com</a>.
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearCredentials}
                className="text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-md transition"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={loadDemoCredentials}
                className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Fill Sandbox Keys
              </button>
            </div>
          </div>

          {/* Environment Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Target API Environment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'sandbox_global', name: 'Global Sandbox', url: 'api-sandbox.ship.uniuni.com', badge: 'Test' },
                { id: 'prod_global', name: 'Global Production', url: 'api.ship.uniuni.com/prod', badge: 'Live' },
                { id: 'ca_qa', name: 'Canada QA / Testing', url: 'sjqa.uniexpress.org', badge: 'CA' },
                { id: 'ca_prod', name: 'Canada Production', url: 'sj.uniexpress.ca', badge: 'CA Live' },
                { id: 'us_qa', name: 'USA QA / Testing', url: 'prm-api.qa.uniuni.com', badge: 'US' },
                { id: 'us_prod', name: 'USA Production', url: 'prm-api.uniuni.com', badge: 'US Live' },
              ].map((env) => (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, environment: env.id as UniUniEnvironment })}
                  className={`text-left p-3 rounded-lg border text-xs transition flex flex-col justify-between ${
                    formData.environment === env.id
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 text-slate-900 font-medium'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{env.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {env.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono truncate">{env.url}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Access Token Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Bearer Access Token
              </label>
              {formData.accessToken && (
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Passed in the <code className="text-slate-700 font-mono">Authorization: Bearer &lt;token&gt;</code> request header for all shipment and tracking requests.
            </p>
          </div>

          {/* Client ID and Secret */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Client ID (App Key)
              </label>
              <input
                type="text"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                placeholder="e.g. uni_client_prod_..."
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Client Secret
              </label>
              <input
                type="password"
                value={formData.clientSecret}
                onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                placeholder="••••••••••••••••••••"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Customer Number & Auto Simulation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer / Account Number (Optional)
              </label>
              <input
                type="text"
                value={formData.customerNumber}
                onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
                placeholder="e.g. UNICA10928"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.autoSimulateIfOffline}
                  onChange={(e) => setFormData({ ...formData, autoSimulateIfOffline: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700">
                  Auto-fallback to Sandbox Simulation if API returns network error
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <a
              href="https://docs.uniuni.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View UniUni Official Docs
            </a>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-medium px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5"
              >
                {showSavedToast ? <Check className="w-4 h-4" /> : null}
                {showSavedToast ? 'Saved!' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
