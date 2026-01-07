import { Link, Outlet } from "react-router-dom";

export default function Layout({ setAuth, userRole, restaurantId }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 font-bold text-amber-400 border-b border-slate-800">
          {userRole === "admin" ? "🛡️ Admin Panel" : "🏪 Restaurant Panel"}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* ===== ADMIN ===== */}
          {userRole === "admin" && (
            <>
              <Link
                to="/admin/dashboard"
                className="block p-3 rounded hover:bg-slate-800"
              >
                📊 Dashboard
              </Link>

              <Link
                to="/admin/restaurants"
                className="block p-3 rounded hover:bg-slate-800"
              >
                🏪 Restaurants
              </Link>

              <Link
                to="/categories"
                className="block p-3 rounded hover:bg-slate-800"
              >
                📁 Categories
              </Link>
            </>
          )}

          {/* ===== RESTAURANT ===== */}
          {userRole === "restaurant" && (
            <>
              <Link
                to="/restaurant/dashboard"
                className="block p-3 rounded hover:bg-slate-800"
              >
                📊 Dashboard
              </Link>

              <Link
                to={`/restaurant/${restaurantId}/menu`}
                className="block p-3 rounded hover:bg-slate-800"
              >
                📦 Products
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            setAuth(false);
          }}
          className="m-4 p-2 bg-red-500 rounded font-bold"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
