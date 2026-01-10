import { useEffect, useMemo, useRef } from "react";
import { useRestaurantStore } from "../store/useRestaurantStore";
import { useProductStore } from "../store/useProductStore";
import { QRCodeCanvas } from "qrcode.react";
import {
  Mail, MapPin, Utensils, ShieldCheck, Globe, Building2,
  Package, CheckCircle2, Leaf, Coffee, Flame, Wifi,
  QrCode, ImageIcon, FileJson, FileText, Download
} from "lucide-react";

export default function RestaurantDashboard() {
  const { fetchRestaurantById, selectedRestaurant } = useRestaurantStore();
  const { products, fetchProducts } = useProductStore();
  const qrRef = useRef(null);

  useEffect(() => {
    const restaurantId = Number(localStorage.getItem("restaurant_id"));
    if (!restaurantId) return;
    fetchRestaurantById(restaurantId);
    fetchProducts(restaurantId);
  }, [fetchRestaurantById, fetchProducts]);

  // Generate the stats for the dashboard
  const stats = useMemo(() => {
    return {
      total: products.length,
      available: products.filter(p => p.available).length,
      veg: products.filter(p => p.veg).length,
      iced: products.filter(p => p.iced).length,
      categories: new Set(products.flatMap(p => p.categories.map(c => c.name))).size
    };
  }, [products]);

  // Construct the Public URL for the QR Code
  const publicUrl = useMemo(() => {
    if (!selectedRestaurant) return "";
    const base = window.location.origin;
    const { country_code, state_code, city_code, email } = selectedRestaurant;
    const identifier = email.split("@")[0]
    return `${base}/${country_code}/${state_code}/${city_code}/${identifier}`;
  }, [selectedRestaurant]);

  // Download Handler for different formats
  const downloadQR = (format) => {
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    if (format === 'pdf') {
      const dataUrl = canvas.toDataURL("image/png");
      const windowContent = `
        <!DOCTYPE html>
        <html>
          <head><title>Print Menu QR</title></head>
          <body style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
            <h1 style="margin-bottom:20px;">${selectedRestaurant.name}</h1>
            <img src="${dataUrl}" style="width:400px; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
            <p style="margin-top:20px; color:#666;">Scan to view our digital menu</p>
          </body>
        </html>`;
      const printWin = window.open('', '', 'width=800,height=800');
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
      setTimeout(() => { printWin.print(); }, 500);
    } else {
      const url = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : 'png'}`);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedRestaurant.identifier}-menu-qr.${format}`;
      link.click();
    }
  };

  if (!selectedRestaurant) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 antialiased pb-20">

      {/* 1. RESTAURANT PROFILE CARD */}
      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
              {selectedRestaurant.logo_url ? (
                <img src={selectedRestaurant.logo_url} alt="logo" className="object-cover w-full h-full" />
              ) : (
                <Building2 size={32} className="text-slate-300" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{selectedRestaurant.name}</h1>
                {selectedRestaurant.pure_veg && (
                  <ShieldCheck size={18} className="text-emerald-500" fill="currentColor" fillOpacity={0.1} />
                )}
              </div>
              <p className="text-slate-500 text-sm font-medium flex items-center justify-center md:justify-start gap-2 mt-1 capitalize">
                <Utensils size={14} className="text-slate-400" /> {selectedRestaurant.type} Specialist
              </p>
            </div>

            <div className="hidden md:block px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none mb-1">Store ID</span>
              <span className="font-mono font-bold text-slate-600">#{selectedRestaurant.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-50">
            <InfoItem icon={<Mail size={15} />} label="Email" value={selectedRestaurant.email} />
            <InfoItem icon={<MapPin size={15} />} label="Location" value={selectedRestaurant.location} />
            <InfoItem icon={<Globe size={15} />} label="Region" value={`${selectedRestaurant.city_code}, ${selectedRestaurant.state_code}`} />
            <InfoItem icon={<Building2 size={15} />} label="City" value={selectedRestaurant.city_code} />
          </div>
        </div>
      </section>

      {/* 2. LIVE STATUS BANNER */}
      <div className="bg-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-md shadow-indigo-100">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Wifi size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Restaurant is Live</h4>
            <p className="text-xs text-indigo-100">
              Visible at:{" "}
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white hover:text-indigo-300"
              >
                {publicUrl}
              </a>
            </p>
          </div>

        </div>
        <div className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
          Operational
        </div>
      </div>

      {/* 3. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Package size={20} />} label="Total Items" value={stats.total} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Active" value={stats.available} color="text-emerald-500" />
        <StatCard icon={<Leaf size={20} />} label="Veg Only" value={stats.veg} color="text-green-500" />
        <StatCard icon={<Coffee size={20} />} label="Categories" value={stats.categories} color="text-orange-500" />
      </div>

      {/* 4. COMPOSITION BREAKDOWN */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Flame size={16} className="text-orange-500" /> Menu Health Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProgressItem label="Non-Veg Content" value={stats.total - stats.veg} total={stats.total} color="bg-rose-500" />
          <ProgressItem label="Cold/Iced Items" value={stats.iced} total={stats.total} color="bg-sky-400" />
          <ProgressItem label="Hidden Items" value={stats.total - stats.available} total={stats.total} color="bg-slate-300" />
        </div>
      </div>

      {/* 5. QR CODE SECTION */}
      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-10 items-center">

          <div className="space-y-4 flex flex-col items-center">
            <div ref={qrRef} className="p-6 bg-white rounded-[2.5rem] border-4 border-slate-50 shadow-xl shadow-slate-200/50">
              <QRCodeCanvas
                value={publicUrl}
                size={180}
                level={"H"}
                includeMargin={false}
                imageSettings={selectedRestaurant.logo_url ? {
                  src: selectedRestaurant.logo_url,
                  height: 40,
                  width: 40,
                  excavate: true,
                } : undefined}
              />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan to preview</p>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
                <QrCode className="text-indigo-600" /> Menu QR Code
              </h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">
                Download and print this QR code for your tables or storefront.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DownloadButton onClick={() => downloadQR('png')} icon={<ImageIcon size={18} />} label="PNG" subtext="Transparent" />
              <DownloadButton onClick={() => downloadQR('jpeg')} icon={<FileJson size={18} />} label="JPG" subtext="High Quality" />
              <DownloadButton onClick={() => downloadQR('pdf')} icon={<FileText size={18} />} label="PDF" subtext="Print Ready" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// HELPERS (Local to this file)

function DownloadButton({ onClick, icon, label, subtext }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
    >
      <div className="text-slate-400 group-hover:text-indigo-600 transition-colors mb-2">{icon}</div>
      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{subtext}</span>
    </button>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-400 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">{label}</p>
        <p className="text-xs font-semibold text-slate-700 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color = "text-indigo-500" }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${color}`}>{icon}</div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function ProgressItem({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[11px] font-bold">
        <span className="text-slate-500 uppercase">{label}</span>
        <span className="text-slate-900">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-8 w-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}