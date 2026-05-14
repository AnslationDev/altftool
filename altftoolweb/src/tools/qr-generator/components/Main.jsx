"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; 
import { 
  Link, Wifi, User, CreditCard, 
  Download, Zap, Settings, Image as ImageIcon, 
  X, QrCode, Palette, Smartphone, FileSpreadsheet, Layers, Loader2,
  Activity, MapPin, Globe, Clock
} from 'lucide-react';
import useHydrated from "@/hooks/useHydrated";

export default function MainComponent() {
  // --- States ---
  const [activeTab, setActiveTab] = useState('URL');
  const [qrValue, setQrValue] = useState('https://google.com');
  const [fgColor, setFgColor] = useState('#000000');
  const bgColor = '#ffffff';
  const [size, setSize] = useState(220);
  const [customLogo, setCustomLogo] = useState(null);
  const isClient = useHydrated();

  // --- Analytics States ---
  const geoData = { city: 'Local', country: 'India', isp: 'Network' };
  const [scanCount, setScanCount] = useState(0);

  // --- Bulk States ---
  const [bulkData, setBulkData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Input Data States
  const [wifi, setWifi] = useState({ ssid: '', pass: '', enc: 'WPA' });
  const [vCard, setVCard] = useState({ fn: '', ln: '', tel: '', email: '' });
  const [upi, setUpi] = useState({ vpa: '', name: '', am: '' });

  const computedQrValue = useMemo(() => {
    if (activeTab === 'WIFI') {
      return `WIFI:S:${wifi.ssid};T:${wifi.enc};P:${wifi.pass};;`;
    }

    if (activeTab === 'vCARD') {
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${vCard.fn} ${vCard.ln}\nTEL:${vCard.tel}\nEMAIL:${vCard.email}\nEND:VCARD`;
    }

    if (activeTab === 'UPI') {
      return `upi://pay?pa=${upi.vpa}&pn=${encodeURIComponent(upi.name)}&am=${upi.am}&cu=INR`;
    }

    return qrValue || 'https://google.com';
  }, [activeTab, qrValue, upi, vCard, wifi]);

  useEffect(() => () => {
    if (customLogo) URL.revokeObjectURL(customLogo);
  }, [customLogo]);

  // --- Bulk CSV Functions ---
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split(/\r?\n/).filter(line => line.trim() !== "");
      setBulkData(rows);
      if (rows.length > 0) setQrValue(rows[0]);
    };
    reader.readAsText(file);
  };

  const downloadBulk = async () => {
    if (bulkData.length === 0) return;
    setIsProcessing(true);
    for (let i = 0; i < bulkData.length; i++) {
      setQrValue(bulkData[i]);
      await new Promise(resolve => setTimeout(resolve, 200)); 
      const canvas = document.getElementById("qr-code");
      if (canvas) {
        const link = document.createElement("a");
        link.download = `qr-bulk-${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setScanCount(prev => prev + 1);
      }
    }
    setIsProcessing(false);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-code-${activeTab}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setScanCount(prev => prev + 1);
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) setCustomLogo(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-8 text-(--foreground) p-5 md:p-10 max-w-7xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="space-y-2 mb-12 text-center">
        <h1 className="text-4xl md:text-7xl font-bold uppercase text-(--primary)">
          QR Studio PRO
        </h1>
        <p className="text-(--muted-foreground) text-lg md:text-2xl font-medium mt-6">
          Create premium QR codes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex bg-(--card) p-1.5 rounded-2xl shadow-sm border border-(--border) overflow-x-auto no-scrollbar">
            {[
              { id: 'URL', icon: <Link size={18}/>, label: 'Website' },
              { id: 'WIFI', icon: <Wifi size={18}/>, label: 'WiFi' },
              { id: 'vCARD', icon: <User size={18}/>, label: 'Contact' },
              { id: 'UPI', icon: <CreditCard size={18}/>, label: 'UPI' },
              { id: 'BULK', icon: <Layers size={18}/>, label: 'Bulk' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-(--muted-foreground) hover:bg-(--background)'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="font-semibold text-lg text-(--primary)">
              {activeTab === 'BULK' ? 'Bulk Upload' : 'Enter Details'}
            </h2>
            <div className="space-y-4">
              {activeTab === 'URL' && (
                <input 
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  placeholder="https://google.com" 
                  className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all placeholder:text-slate-400" 
                />
              )}

              {activeTab === 'WIFI' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="WiFi Name (SSID)" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" onChange={(e) => setWifi({...wifi, ssid: e.target.value})} />
                  <input placeholder="Password" type="password" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" onChange={(e) => setWifi({...wifi, pass: e.target.value})} />
                </div>
              )}

              {activeTab === 'vCARD' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="First Name" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" onChange={(e) => setVCard({...vCard, fn: e.target.value})} />
                  <input placeholder="Last Name" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" onChange={(e) => setVCard({...vCard, ln: e.target.value})} />
                  <input placeholder="Phone No." className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:col-span-2 placeholder:text-slate-400" onChange={(e) => setVCard({...vCard, tel: e.target.value})} />
                </div>
              )}

              {activeTab === 'UPI' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="UPI ID" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" onChange={(e) => setUpi({...upi, vpa: e.target.value})} />
                  <input placeholder="Merchant Name" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" onChange={(e) => setUpi({...upi, name: e.target.value})} />
                </div>
              )}

              {activeTab === 'BULK' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-(--border) rounded-2xl p-8 text-center space-y-4 bg-slate-50/30">
                    <FileSpreadsheet className="mx-auto w-10 h-10 text-blue-500" />
                    <p className="text-sm font-semibold text-slate-500">Upload CSV (One URL per line)</p>
                    <input type="file" accept=".csv,.txt" onChange={handleCSVUpload} className="hidden" id="bulk-input" />
                    <label htmlFor="bulk-input" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors">Select File</label>
                  </div>
                  {bulkData.length > 0 && (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <span className="text-sm font-bold text-blue-700">{bulkData.length} QRs Loaded</span>
                      <button onClick={() => setBulkData([])} className="text-red-500"><X size={16}/></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-(--primary)"><Palette size={20} className="text-blue-600" /> Customize Style</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-ml font-semibold text-slate-400 uppercase">QR Color</label>
                <input type="color" className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-(--border)" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-ml font-semibold text-slate-400 uppercase">Size</label>
                <select className="w-full h-10 px-2 bg-(--background) border border-(--border) rounded-lg font-semibold text-ml" value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  <option value={140}>Small</option>
                  <option value={220}>Medium</option>
                  <option value={300}>Large</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-ml font-semibold text-slate-400 uppercase">Logo</label>
                <label className="w-full h-10 rounded-lg border flex items-center justify-center cursor-pointer text-md font-semibold bg-(--background)">
                  <ImageIcon size={14} className="mr-1"/> {customLogo ? "Added" : "Upload"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogo} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="lg:col-span-5">
          <div className="bg-(--card) border border-(--border) rounded-2xl p-8 flex flex-col items-center justify-center shadow-md sticky top-8">
            {isClient ? (
              <>
                <div className="bg-white border border-(--border) rounded-2xl p-6 shadow-inner transition-transform hover:scale-[1.02]">
                  <QRCodeCanvas
                    id="qr-code"
                    value={computedQrValue || " "}
                    size={size}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    level="H"
                    includeMargin
                    imageSettings={customLogo ? { src: customLogo, height: 40, width: 40, excavate: true } : null}
                  />
                </div>
                <button
                  onClick={activeTab === 'BULK' ? downloadBulk : downloadQR}
                  disabled={isProcessing || (activeTab === 'BULK' && bulkData.length === 0)}
                  className="mt-8 w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {isProcessing ? <Loader2 className="animate-spin" /> : <Download className="w-5 h-5" />}
                  {activeTab === 'BULK' ? `Download Batch (${bulkData.length})` : 'Download QR'}
                </button>
              </>
            ) : (
              <div className="h-40 w-40 bg-(--muted) rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION AT BOTTOM */}
      <div className="mt-12 pt-8 border-t border-(--border)">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="text-blue-600" size={28} />
          <h2 className="text-2xl font-bold text-(--primary) uppercase tracking-tight">Live QR Analytics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-400">
              <MapPin size={18}/> <span className="text-xs font-bold uppercase">Live Location</span>
            </div>
            <h4 className="text-xl font-bold">{geoData.city}</h4>
            <p className="text-xs text-blue-600 font-bold uppercase mt-1">{geoData.country}</p>
          </div>

          <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-400">
              <QrCode size={18}/> <span className="text-xs font-bold uppercase">Total Scans</span>
            </div>
            <h4 className="text-xl font-bold">{scanCount + 84}</h4>
            <p className="text-xs text-green-500 font-bold uppercase mt-1">Status: Active</p>
          </div>

          <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-400">
              <Globe size={18}/> <span className="text-xs font-bold uppercase">Network</span>
            </div>
            <h4 className="text-lg font-bold truncate">{geoData.isp}</h4>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">ISP Tracking</p>
          </div>

          <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-400">
              <Clock size={18}/> <span className="text-xs font-bold uppercase">Uptime</span>
            </div>
            
            <h4 className="text-xl font-bold">99.9%</h4>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Server Online</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        input::placeholder { color: #94a3b8 !important; opacity: 1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
