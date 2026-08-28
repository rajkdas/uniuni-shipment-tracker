import React, { useState, useEffect } from 'react';
import { Shipment, UniUniConfig, BatchManifest } from './types/uniuni';
import { UniUniApiClient } from './services/apiClient';
import { Header } from './components/Header';
import { ShipmentsView } from './components/ShipmentsView';
import { TrackingView } from './components/TrackingView';
import { SortCodeView } from './components/SortCodeView';
import { RateCalculatorView } from './components/RateCalculatorView';
import { BatchesView } from './components/BatchesView';
import { ApiExplorerView } from './components/ApiExplorerView';
import { WebhookView } from './components/WebhookView';
import { CreateShipmentModal } from './components/CreateShipmentModal';
import { ShipmentLabelModal } from './components/ShipmentLabelModal';
import { CredentialsModal } from './components/CredentialsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('tracking');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoadingShipments, setIsLoadingShipments] = useState(false);

  // Config State
  const [config, setConfig] = useState<UniUniConfig>(() => {
    const saved = localStorage.getItem('uniuni_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      environment: 'sandbox_global',
      accessToken: 'uni_demo_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sandbox_key_90281',
      clientId: 'uni_client_sandbox_881920',
      clientSecret: 'uni_sec_991823719284719284',
      customerNumber: 'UNICA90281',
      autoSimulateIfOffline: true,
    };
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [activeLabelShipment, setActiveLabelShipment] = useState<Shipment | null>(null);
  const [targetTrackingNumber, setTargetTrackingNumber] = useState<string>('');

  // Initial load
  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setIsLoadingShipments(true);
    try {
      const data = await UniUniApiClient.getShipments();
      if (data.success && data.shipments) {
        setShipments(data.shipments);
      }
    } catch (err) {
      console.error('Failed to load shipments:', err);
    } finally {
      setIsLoadingShipments(false);
    }
  };

  const handleSaveConfig = (newConfig: UniUniConfig) => {
    setConfig(newConfig);
    localStorage.setItem('uniuni_config', JSON.stringify(newConfig));
  };

  const handlePurchaseShipment = async (shipmentId: string) => {
    try {
      const data = await UniUniApiClient.purchaseShipment(shipmentId);
      if (data.success) {
        // Refresh shipments list
        fetchShipments();
        // Prompt user to open label
        const updated = shipments.find((s) => s.id === shipmentId);
        if (updated) {
          setActiveLabelShipment({ ...updated, status: 'PURCHASED' });
        }
      }
    } catch (err: any) {
      alert('Failed to purchase shipment: ' + err.message);
    }
  };

  const handleCancelShipment = async (shipmentId: string) => {
    if (!confirm('Are you sure you want to cancel and void this shipment label?')) return;
    try {
      const data = await UniUniApiClient.cancelShipment(shipmentId);
      if (data.success) {
        fetchShipments();
      }
    } catch (err: any) {
      alert('Failed to cancel shipment: ' + err.message);
    }
  };

  const handleAdvanceMilestone = async (shipmentId: string, nextStatus: string) => {
    try {
      const data = await UniUniApiClient.advanceMilestone(shipmentId, nextStatus);
      if (data.success) {
        fetchShipments();
      }
    } catch (err: any) {
      alert('Failed to advance tracking status: ' + err.message);
    }
  };

  const handleCreateBatchFromSelection = async (selectedIds: string[]) => {
    try {
      const data = await UniUniApiClient.createBatch({
        shipmentIds: selectedIds,
        hubCode: 'YYZ-01 (Toronto Gateway)',
        driverName: 'Assigned Uni Courier',
      });
      if (data.success) {
        setActiveTab('batches');
      }
    } catch (err: any) {
      alert('Failed to create batch: ' + err.message);
    }
  };

  const handleTrackShipment = (trackingNo: string) => {
    setTargetTrackingNumber(trackingNo);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Global Header & Nav */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onOpenCredentials={() => setIsCredentialsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'shipments' && (
          <ShipmentsView
            shipments={shipments}
            isLoading={isLoadingShipments}
            onRefresh={fetchShipments}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onOpenLabel={(shipment) => setActiveLabelShipment(shipment)}
            onOpenTracking={handleTrackShipment}
            onPurchase={handlePurchaseShipment}
            onCancel={handleCancelShipment}
            onAdvanceMilestone={handleAdvanceMilestone}
            onCreateBatch={handleCreateBatchFromSelection}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingView
            initialTrackingNumber={targetTrackingNumber}
            onAdvanceMilestone={handleAdvanceMilestone}
            shipments={shipments}
            config={config}
            onOpenCredentials={() => setIsCredentialsModalOpen(true)}
          />
        )}

        {activeTab === 'sort-codes' && <SortCodeView />}

        {activeTab === 'rates' && <RateCalculatorView />}

        {activeTab === 'batches' && <BatchesView shipments={shipments} />}

        {activeTab === 'explorer' && (
          <ApiExplorerView
            config={config}
            onOpenCredentials={() => setIsCredentialsModalOpen(true)}
          />
        )}

        {activeTab === 'webhooks' && <WebhookView shipments={shipments} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            UniUni Logistics Shipping API Platform • Developer Sandbox & Production Gateway
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <a
              href="https://docs.uniuni.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 transition"
            >
              API Reference
            </a>
            <span>•</span>
            <button
              onClick={() => setIsCredentialsModalOpen(true)}
              className="hover:text-emerald-600 transition"
            >
              API Credentials
            </button>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">
              Format: YYZ-A / LAX-A (Conveyor Sorted)
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateShipmentModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={(newShipment) => {
            fetchShipments();
            setActiveLabelShipment(newShipment);
          }}
        />
      )}

      {activeLabelShipment && (
        <ShipmentLabelModal
          shipment={activeLabelShipment}
          onClose={() => setActiveLabelShipment(null)}
        />
      )}

      {isCredentialsModalOpen && (
        <CredentialsModal
          config={config}
          onSave={handleSaveConfig}
          onClose={() => setIsCredentialsModalOpen(false)}
        />
      )}
    </div>
  );
}
