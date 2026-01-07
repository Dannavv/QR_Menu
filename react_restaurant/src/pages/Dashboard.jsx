import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/useRestaurantStore';

export default function Dashboard() {
  const { restaurants, fetchRestaurants, isLoading } = useRestaurantStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading restaurants...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          My Restaurants
        </h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
          + Register New Restaurant
        </button>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((res) => (
          <div 
            key={res.id} 
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{res.name}</h3>
              <p className="text-sm text-gray-500 mt-1">ID: #{res.id}</p>
            </div>
            
            <button 
              onClick={() => navigate(`/restaurant/${res.id}/menu`)}
              className="w-full mt-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 transition-colors"
            >
              Configure Digital Menu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}