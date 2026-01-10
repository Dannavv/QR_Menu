import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, Edit, Trash2, Plus, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RestaurantManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const navigate = useNavigate();

  // URL Friendly Formatter
  const slugify = (text) => text?.toLowerCase().trim().replace(/\s+/g, '-') || "any";

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await api.getRestaurants();
        setRestaurants(res.data);
      } catch (err) {
        setError("Failed to load restaurants.");
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  // NAVIGATION TO PUBLIC MENU
  const handleRowClick = (r) => {
    const country = slugify(r.country_code);
    const state = slugify(r.state_code);
    const city = slugify(r.city_code);
    const identifier = r.identifier || slugify(r.email?.split("@")[0]);

    navigate(`/${country}/${state}/${city}/${identifier}`);
  };

  const handleDelete = async (restaurantId) => {
    if (!window.confirm("Delete this restaurant? This cannot be undone.")) return;

    try {
      await api.deleteRestaurant(restaurantId);
      setRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
    } catch (err) {
      alert("Failed to delete restaurant");
    }
  };

  // Filter Logic
  const filteredData = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                          r.location?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || r.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return <LoadingScreen />;

  return (
    <div className="m-6 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Outlets</h1>
          <p className="text-sm font-medium text-slate-500">Manage global restaurant profiles</p>
        </div>
        <button
          onClick={() => navigate("/admin/restaurants/new")}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={20} /> Add Restaurant
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or area..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-slate-200 rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Cafe">Cafe</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Fast Food">Fast Food</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <th className="px-8 py-5">Restaurant</th>
              <th className="px-8 py-5">Details</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((r) => (
              <tr 
                key={r.id} 
                onClick={() => handleRowClick(r)} 
                className="hover:bg-slate-50/80 transition-all group cursor-pointer"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm">
                      {r.logo_url ? (
                        <img src={r.logo_url} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Building2 size={24} /></div>
                      )}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-lg tracking-tight">{r.name}</div>
                      <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{r.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="text-sm font-bold text-slate-600">{r.location || "No Location"}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-tighter">{r.email}</div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/restaurants/edit/${r.id}`); }}
                      className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition shadow-sm"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                      className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 rounded-xl transition shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="p-24 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Outlets...</p>
    </div>
  );
}