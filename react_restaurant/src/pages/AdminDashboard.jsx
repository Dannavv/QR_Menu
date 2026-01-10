import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Country, State } from "country-state-city";
import { 
  Building2, Users, Globe, ShieldCheck, 
  ChevronRight, MapPin, Utensils, Activity,
  PieChart, LayoutGrid, PlusCircle
} from "lucide-react";

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await api.getRestaurants(); // Assuming this returns the full list
        setRestaurants(res.data);
      } catch (err) {
        console.error("Admin fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Global Platform Stats
  const adminStats = useMemo(() => {
    return {
      totalOutlets: restaurants.length,
      pureVegOutlets: restaurants.filter(r => r.pure_veg).length,
      uniqueCountries: new Set(restaurants.map(r => r.country_code)).size,
      uniqueCities: new Set(restaurants.map(r => r.city_code)).size,
    };
  }, [restaurants]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 antialiased pb-20">
      
      {/* 1. ADMIN HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Overview</h1>
          <p className="text-slate-500 font-medium">Platform Management & Restaurant Analytics</p>
        </div>
     
      </header>

      {/* 2. PLATFORM STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Building2 size={24} />} label="Total Outlets" value={adminStats.totalOutlets} color="text-indigo-600" />
        <StatCard icon={<ShieldCheck size={24} />} label="Pure Veg Stores" value={adminStats.pureVegOutlets} color="text-emerald-600" />
        <StatCard icon={<Globe size={24} />} label="Countries" value={adminStats.uniqueCountries} color="text-sky-600" />
        <StatCard icon={<Activity size={24} />} label="Cities Live" value={adminStats.uniqueCities} color="text-orange-600" />
      </div>

      {/* 3. GEOGRAPHICAL REACH (Visual Breakdown) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <PieChart size={20} />
           </div>
           <h3 className="text-xl font-black text-slate-900">Platform Composition</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProgressItem 
            label="Pure Veg vs Non-Veg Ratio" 
            value={adminStats.pureVegOutlets} 
            total={adminStats.totalOutlets} 
            color="bg-emerald-500" 
          />
          <ProgressItem 
            label="Multi-City Presence" 
            value={adminStats.uniqueCities} 
            total={adminStats.totalOutlets} 
            color="bg-indigo-500" 
          />
        </div>
      </div>

      {/* 4. RESTAURANT DIRECTORY GRID */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <LayoutGrid size={20} className="text-slate-400" />
           <h3 className="text-xl font-black text-slate-900">Registered Outlets</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((res) => (
            <Link 
              key={res.id} 
              to={`/${res.country_code}/${res.state_code}/${res.city_code}/${res.email.split('@')[0]}`}
              className="bg-white group p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 relative overflow-hidden"
            >
              {/* Status Indicator */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {res.logo_url ? (
                    <img src={res.logo_url} alt="logo" className="object-cover w-full h-full" />
                  ) : (
                    <Building2 size={24} className="text-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{res.name}</h4>
                  <p className="text-xs font-medium text-slate-500">{res.type}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <MapPin size={14} className="text-slate-300" />
                  {res.city_code}, {res.state_code}
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      <Utensils size={12} /> View Digital Menu
                   </div>
                   <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// Reusable Stat Component
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className={`${color} mb-4`}>{icon}</div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

// Reusable Progress Component
function ProgressItem({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-900">{Math.round(percentage)}%</span>
      </div>
      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-10 w-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}