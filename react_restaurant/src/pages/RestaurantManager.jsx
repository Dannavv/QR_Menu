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

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await api.getRestaurants();
        setRestaurants(res.data);
      } catch (err) {
        setError("Failed to load restaurants. Please check admin permissions.");
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  // Filter Logic
  const filteredData = restaurants.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (restaurantId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this restaurant? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await api.deleteRestaurant(restaurantId);
      // Remove from UI instantly
      setRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
    } catch (err) {
      alert("Failed to delete restaurant");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600 font-medium">Loading Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500 bg-red-50 m-6 rounded-lg border border-red-200">{error}</div>;

  return (
    <div className="m-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* --- Header Section --- */}
      <div className="p-6 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Directory</h1>
          <p className="text-sm text-gray-500">Manage {restaurants.length} registered outlets</p>
        </div>
        <button
          onClick={() => navigate("/admin/restaurants/new")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-100 text-sm font-bold"
        >
          <Plus size={18} /> Add New Restaurant
        </button>
      </div>

      {/* --- Toolbar --- */}
      <div className="p-4 bg-gray-50/50 border-b flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or location..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Cafe">Cafe</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Bakery">Bakery</option>
        </select>
      </div>

      {/* --- Table Section --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Brand & Contact</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Dietary</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map((r) => (
                <tr key={r.id} className="hover:bg-indigo-50/20 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Logo Preview in Table */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
                        {r.logo_url ? (
                          <img src={r.logo_url} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Building2 size={20} />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-gray-900 leading-tight">{r.name}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[200px] mt-0.5">
                          {r.location || "Location not set"} • {r.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-600 shadow-sm">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.pure_veg ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                        Veg Only
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">
                        Multi-Cuisine
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/admin/restaurants/edit/${r.id}`)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Restaurant"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Restaurant"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search size={40} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">No restaurants found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}