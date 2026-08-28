import React, { useEffect, useRef, useState } from 'react';
import { Shipment } from '../types/uniuni';
import { Printer, Download, X, Copy, Check, Sparkles, Box, ShieldCheck } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface ShipmentLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
}

export const ShipmentLabelModal: React.FC<ShipmentLabelModalProps> = ({
  isOpen,
  onClose,
  shipment,
}) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedZpl, setCopiedZpl] = useState(false);

  useEffect(() => {
    if (shipment && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, shipment.trackingNumber, {
          format: 'CODE128',
          width: 2.1,
          height: 70,
          displayValue: false,
          margin: 0,
          lineColor: '#000000',
        });
      } catch (err) {
        console.error('Barcode render error:', err);
      }

      // Generate QR Code with tracking URL
      QRCode.toDataURL(
        `https://www.uniuni.com/tracking?trackingNumber=${shipment.trackingNumber}`,
        { width: 120, margin: 1 }
      )
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [shipment, isOpen]);

  if (!isOpen || !shipment) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-uniuni-label');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=600,height=850');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>UniUni Shipping Label - ${shipment.trackingNumber}</title>
            <style>
              @page { size: 4in 6in; margin: 0; }
              body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
              * { box-sizing: border-box; }
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body onload="window.print();window.close();">
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const generateZPL = () => {
    return `^XA
^PW812
^LL1218
^FO50,50^A0N,40,40^FDUNIUNI LOGISTICS^FS
^FO50,100^GB712,3,3^FS
^FO50,120^A0N,55,55^FD${shipment.sortCode || 'YYZ-A 021'}^FS
^FO550,120^A0N,45,45^FD${shipment.destinationAirport || 'YYZ'}^FS
^FO50,190^GB712,3,3^FS
^FO50,210^A0N,25,25^FDFROM: ${shipment.sender.company || shipment.sender.name}^FS
^FO50,240^A0N,20,20^FD${shipment.sender.addressLine1}, ${shipment.sender.city}, ${shipment.sender.stateOrProvince} ${shipment.sender.postalCode}^FS
^FO50,280^GB712,2,2^FS
^FO50,300^A0N,25,25^FDSHIP TO:^FS
^FO50,335^A0N,36,36^FD${shipment.recipient.name}^FS
^FO50,380^A0N,30,30^FD${shipment.recipient.addressLine1} ${shipment.recipient.addressLine2 || ''}^FS
^FO50,420^A0N,32,32^FD${shipment.recipient.city}, ${shipment.recipient.stateOrProvince}  ${shipment.recipient.postalCode}^FS
^FO50,470^GB712,3,3^FS
^FO100,530^BCN,140,N,N,N^FD${shipment.trackingNumber}^FS
^FO180,690^A0N,35,35^FD${shipment.trackingNumber}^FS
^FO50,750^GB712,3,3^FS
^FO50,780^A0N,24,24^FDORDER: ${shipment.orderNumber}^FS
^FO50,815^A0N,24,24^FDWEIGHT: ${shipment.package.weight} ${shipment.package.weightUnit.toUpperCase()}^FS
^FO550,770^BQN,2,4^FDQA,https://uniuni.com/tracking?${shipment.trackingNumber}^FS
^XZ`;
  };

  const handleCopyZpl = () => {
    navigator.clipboard.writeText(generateZPL());
    setCopiedZpl(true);
    setTimeout(() => setCopiedZpl(false), 2000);
  };

  const getServiceLabel = (code: string) => {
    switch (code) {
      case 'UNI_PRIORITY':
        return 'UNIUNI PRIORITY EXPRESS';
      case 'UNI_CROSSBORDER_EXPEDITE':
        return 'UNIUNI DIRECT LINE CROSS-BORDER (DDP)';
      default:
        return 'UNIUNI STANDARD GROUND';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              4" x 6" Thermal Label
            </span>
            <span className="text-xs text-slate-300 font-mono">#{shipment.trackingNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              Print Label
            </button>
            <button
              onClick={handleCopyZpl}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition"
              title="Copy Zebra ZPL Thermal Code"
            >
              {copiedZpl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedZpl ? 'Copied ZPL' : 'ZPL Code'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Label Canvas Container */}
        <div className="p-6 bg-slate-100 flex justify-center">
          {/* 4x6 Authentic Shipping Label */}
          <div
            id="printable-uniuni-label"
            className="w-[380px] bg-white border-2 border-black p-4 text-black font-sans shadow-md select-text"
          >
            {/* Header: Carrier Brand & Service Type */}
            <div className="border-b-2 border-black pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-white font-black text-xs flex items-center justify-center rounded-sm tracking-tighter">
                  UNI
                </div>
                <div>
                  <div className="font-black text-base leading-none tracking-tight">UniUni</div>
                  <div className="text-[10px] font-bold text-slate-700 tracking-wider">LOGISTICS CANADA & US</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-xs tracking-wider">
                  {shipment.recipient.countryCode === 'CA' ? 'CANADA DOMESTIC' : 'US / CROSS-BORDER'}
                </div>
                <div className="text-[10px] font-mono mt-0.5 text-slate-700">
                  {new Date(shipment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Sort Code Block (CRITICAL FOR UNIUNI DRIVER ROUTING) */}
            <div className="border-b-2 border-black py-2 flex items-center justify-between bg-slate-50 px-2">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">SORT CODE / ROUTE</div>
                <div className="text-2xl font-black tracking-tight font-mono leading-none">
                  {shipment.sortCode || 'YYZ-A 021'}
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">HUB AIRPORT</div>
                  <div className="text-2xl font-black font-mono leading-none">
                    {shipment.destinationAirport || 'YYZ'}
                  </div>
                </div>
                <div className="w-9 h-9 border-2 border-black flex items-center justify-center font-black text-xl">
                  {shipment.sortingZone || 'A'}
                </div>
              </div>
            </div>

            {/* Sender / Return Address */}
            <div className="border-b border-black py-1.5 text-[11px] leading-tight">
              <div className="font-bold text-[9px] text-slate-600">SHIP FROM:</div>
              <div className="font-semibold">{shipment.sender.company || shipment.sender.name}</div>
              <div>{shipment.sender.addressLine1}</div>
              <div>
                {shipment.sender.city}, {shipment.sender.stateOrProvince} {shipment.sender.postalCode}{' '}
                {shipment.sender.countryCode}
              </div>
            </div>

            {/* Recipient / Delivery Address */}
            <div className="border-b-2 border-black py-2 text-xs leading-snug">
              <div className="font-bold text-[9px] uppercase tracking-wider text-slate-600">SHIP TO:</div>
              <div className="font-black text-sm uppercase">{shipment.recipient.name}</div>
              {shipment.recipient.company && <div className="font-medium text-slate-700">{shipment.recipient.company}</div>}
              <div className="font-semibold text-sm">{shipment.recipient.addressLine1}</div>
              {shipment.recipient.addressLine2 && <div>{shipment.recipient.addressLine2}</div>}
              <div className="font-black text-base tracking-wide mt-0.5">
                {shipment.recipient.city}, {shipment.recipient.stateOrProvince}{' '}
                <span className="bg-black text-white px-1.5 py-0.2 rounded-xs ml-1 font-mono">
                  {shipment.recipient.postalCode}
                </span>
              </div>
              {shipment.recipient.buzzCode && (
                <div className="text-[11px] font-bold text-slate-900 mt-1">
                  BUZZ / GATE CODE: <span className="underline font-mono">{shipment.recipient.buzzCode}</span>
                </div>
              )}
              {shipment.recipient.deliveryInstructions && (
                <div className="text-[10px] italic text-slate-800 bg-amber-50 p-1 border border-amber-200 mt-1 rounded-xs">
                  Note: {shipment.recipient.deliveryInstructions}
                </div>
              )}
            </div>

            {/* Service & Features */}
            <div className="border-b border-black py-1 text-[11px] font-bold flex justify-between items-center">
              <span>SERVICE: {getServiceLabel(shipment.serviceType)}</span>
              {shipment.package.signatureRequired && (
                <span className="border border-black px-1 text-[10px]">SIGNATURE REQ</span>
              )}
            </div>

            {/* Barcode Block */}
            <div className="border-b-2 border-black py-3 flex flex-col items-center justify-center">
              <svg ref={barcodeRef} className="w-full max-w-[340px] h-18"></svg>
              <div className="font-mono font-black text-sm tracking-widest mt-1">
                {shipment.trackingNumber}
              </div>
            </div>

            {/* Bottom Footer Info: QR, Order, Dimensions, Weight */}
            <div className="pt-2 flex items-center justify-between text-[10px]">
              <div className="space-y-0.5 font-mono">
                <div>
                  <span className="font-bold">REF / ORD:</span> {shipment.orderNumber}
                </div>
                <div>
                  <span className="font-bold">WEIGHT:</span> {shipment.package.weight}{' '}
                  {shipment.package.weightUnit.toUpperCase()}
                </div>
                <div>
                  <span className="font-bold">DIMS:</span> {shipment.package.dimensions.length}x
                  {shipment.package.dimensions.width}x{shipment.package.dimensions.height}{' '}
                  {shipment.package.dimensions.unit}
                </div>
                <div className="text-[9px] text-slate-500 font-sans">
                  UniUni Tracking Portal • docs.uniuni.com
                </div>
              </div>

              {qrDataUrl && (
                <div className="flex flex-col items-center">
                  <img src={qrDataUrl} alt="QR Code" className="w-16 h-16 border border-slate-300 p-0.5" />
                  <span className="text-[8px] font-bold mt-0.5">SCAN TRACK</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for thermal label printers (Zebra, Rollo, Munbyn, Dymo 4XL, Brother).</span>
          </div>
          <button
            onClick={onClose}
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
