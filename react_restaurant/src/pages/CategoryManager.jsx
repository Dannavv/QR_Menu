import { useEffect, useState } from 'react';
import { useCategoryStore } from '../store/useCategoryStore';

export default function CategoryManager() {
  const { categories, fetchCategories, createCategory, isLoading } = useCategoryStore();
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createCategory({ name: newName });
    setNewName('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Menu Categories</h2>
        <p className="text-gray-500 text-sm">Organize your menu items into logical sections (e.g., Appetizers, Main Course).</p>
      </header>
      
      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Category Name</label>
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Desserts"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <button 
          type="submit" 
          disabled={!newName.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors h-[42px] whitespace-nowrap"
        >
          Add Category
        </button>
      </form>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p>Fetching categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">No categories found</p>
            <p className="text-sm">Start by adding your first category above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <li 
                key={cat.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center font-bold">
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">ID: {cat.id}</span>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}