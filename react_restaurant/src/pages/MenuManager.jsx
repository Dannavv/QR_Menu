import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { Edit3, Plus, ImageOff, CheckCircle2, XCircle } from 'lucide-react';

export default function MenuManager() {
  const navigate = useNavigate();
  const { rest_id } = useParams();
  const { products, fetchProducts, toggleAvailability, isLoading } = useProductStore();

  useEffect(() => {
    if (rest_id) fetchProducts(rest_id);
  }, [rest_id, fetchProducts]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <p className="text-gray-500 text-sm">Manage dishes, sizes, and dietary preferences.</p>
        </div>
        <button
          onClick={() => navigate(`/restaurant/${rest_id}/menu/add`)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Add New Dish
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-widest">Product</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-widest">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-widest">Pricing & Sizes</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400 font-medium">Loading your menu...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-400 italic">
                   No products found. Click "Add New Dish" to get started.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                  {/* Product Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-lg bg-gray-100 border flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                        {/* Check for image_url or images array */}
                        {p.images?.[0]?.image_url || p.image_url ? (
                          <img 
                            src={p.images?.[0]?.image_url || p.image_url} 
                            alt={p.name} 
                            className="object-cover h-full w-full" 
                          />
                        ) : (
                          <div className="flex flex-col items-center text-[10px] text-gray-400">
                            <ImageOff size={16} />
                            <span>No Image</span>
                          </div>
                        )}
                        {/* Veg/Non-Veg Badge on Image */}
                        <span className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${p.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      </div>
                      <div className="max-w-[200px]">
                        <div className="font-bold text-gray-800 truncate">{p.name}</div>
                        <p className="text-xs text-gray-500 line-clamp-1 italic">
                          {p.description || p.remark || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category Column */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.categories?.length > 0 ? (
                        p.categories.map(cat => (
                          <span key={cat.id} className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase border border-indigo-100">
                            {cat.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Main Menu</span>
                      )}
                    </div>
                  </td>

                  {/* Sizes & Pricing Column */}
                  <td className="px-6 py-4">
                    <div className="space-y-1 min-w-[120px]">
                      {p.sizes?.length > 0 ? (
                        p.sizes.map((s) => (
                          <div key={s.id} className="flex justify-between text-xs border-b border-gray-50 last:border-0 pb-1">
                            <span className="text-gray-500 font-medium">{s.size_label}</span>
                            <span className="font-bold text-gray-700 ml-4">₹{s.price}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded">Price Missing</span>
                      )}
                    </div>
                  </td>

                  {/* Availability Toggle */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <button 
                        onClick={() => toggleAvailability(p.id, p.available)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${p.available ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.available ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-[10px] font-bold uppercase ${p.available ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {p.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/restaurant/${rest_id}/menu/edit/${p.id}`)}
                      className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 group-hover:scale-110"
                      title="Edit Dish"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}