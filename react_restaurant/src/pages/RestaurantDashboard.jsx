export default function RestaurantDashboard({ restId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
        <h3 className="text-gray-500 text-sm font-bold uppercase">Menu Items</h3>
        <p className="text-3xl font-bold text-indigo-600">24</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
        <h3 className="text-gray-500 text-sm font-bold uppercase">Status</h3>
        <p className="text-3xl font-bold text-emerald-600">Active</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
        <h3 className="text-gray-500 text-sm font-bold uppercase">QR Scans</h3>
        <p className="text-3xl font-bold text-orange-600">1,240</p>
      </div>
    </div>
  );
}