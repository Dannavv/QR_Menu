import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, Filter, Edit, Trash2, Plus } from "lucide-react"; // Optional icons
import { useNavigate } from "react-router-dom";

export default function RestaurantManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const navigate = useNavigate(); // Initialize navigate

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
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (restaurantId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this restaurant?"
  );
  if (!confirmed) return;

  try {
    await api.deleteRestaurant(restaurantId);

    // 🔥 Remove from UI instantly (no refetch needed)
    setRestaurants((prev) =>
      prev.filter((r) => r.id !== restaurantId)
    );
  } catch (err) {
    alert("Failed to delete restaurant");
  }
};


  if (loading) return <div className="p-20 text-center animate-pulse text-gray-500">Loading Dashboard...</div>;
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
          onClick={() => navigate("/admin/restaurants/new")} // Navigation call
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
        >
          <Plus size={18} /> Add New Restaurant
        </button>
      </div>

      {/* --- Toolbar (Search & Filter) --- */}
      <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or location..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Cafe">Cafe</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Fast Food">Fast Food</option>
        </select>
      </div>

      {/* --- Table Section --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <th className="px-6 py-4">Restaurant Details</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Veg Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{r.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{r.location || "No Location"} • {r.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.pure_veg ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span> Pure Veg
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm font-bold">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span> Veg and Nonveg
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                        <Edit size={18}

                          onClick={() => navigate(`/admin/restaurants/edit/${r.id}`)}

                        />

                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"

                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                  No restaurants match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}