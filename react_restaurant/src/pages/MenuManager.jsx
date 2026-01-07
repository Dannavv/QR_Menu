import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';

export default function MenuManager() {
  const { rest_id } = useParams();
  const { products, fetchProducts, toggleAvailability, isLoading } = useProductStore();

   // 1️⃣ Fetch when rest_id changes
  useEffect(() => {
    if (!rest_id) return;
    fetchProducts(rest_id);
  }, [rest_id, fetchProducts]);

  // 2️⃣ Console when products update
  useEffect(() => {
    console.log("Fetched products:", products);
  }, [products]);


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <p className="text-gray-500 text-sm">Manage dishes, sizes, and dietary preferences.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95">
          + Add New Dish
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
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
              <tr className="animate-pulse"><td colSpan="5" className="p-20 text-center text-gray-400">Loading menu...</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                  {/* Product Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-lg bg-gray-100 border flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={p.images[0].url} alt={p.name} className="object-cover h-full w-full" />
                        ) : (
                          <span className="text-2xl">{p.veg ? '🟢' : '🔴'}</span>
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          {p.name}
                          {p.veg && <span className="w-2 h-2 rounded-full bg-green-500" title="Veg"></span>}
                        </div>
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
                        <span className="text-gray-400 text-xs italic text-center w-full">Uncategorized</span>
                      )}
                    </div>
                  </td>

                  {/* Sizes & Pricing Column */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {p.sizes?.length > 0 ? (
                        p.sizes.map((s) => (
                          <div key={s.id} className="flex justify-between text-xs border-b border-gray-50 last:border-0 pb-1">
                            <span className="text-gray-500">{s.size_label}:</span>
                            <span className="font-bold text-gray-700">₹{s.price}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-red-500 text-xs font-bold">Price Missing</span>
                      )}
                    </div>
                  </td>

                  {/* Availability Toggle */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <button 
                        onClick={() => toggleAvailability(p.id, p.available)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${p.available ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${p.available ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {p.available ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
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