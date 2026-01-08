import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  Layers, 
  Store, 
  LogOut, 
  UserCircle,
  ChevronRight
} from "lucide-react";

export default function Layout({ setAuth, userRole, restaurantId }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setAuth(false);
    navigate("/login");
  };

  // Improved NavItem with no heavy shadows
  const navItemClass = ({ isActive }) => 
    `flex items-center justify-between gap-3 p-3 rounded-xl transition-all duration-200 group ${
      isActive 
        ? "bg-indigo-600 text-white" 
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
    }`;

  return (
    <div className="flex h-screen bg-white">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Utensils className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-xl tracking-tight uppercase">
            QR_<span className="text-indigo-500">menu</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 mb-4">
            Menu
          </p>

          {/* ===== ADMIN LINKS ===== */}
          {userRole === "admin" && (
            <>
              <NavLink to="/admin/dashboard" className={navItemClass}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} />
                  <span className="text-sm font-medium">Dashboard</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
              </NavLink>

              <NavLink to="/admin/restaurants" className={navItemClass}>
                <div className="flex items-center gap-3">
                  <Store size={18} />
                  <span className="text-sm font-medium">Restaurants</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
              </NavLink>

              <NavLink to="/categories" className={navItemClass}>
                <div className="flex items-center gap-3">
                  <Layers size={18} />
                  <span className="text-sm font-medium">Categories</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
              </NavLink>
            </>
          )}

          {/* ===== RESTAURANT LINKS ===== */}
          {userRole === "restaurant" && (
            <>
              <NavLink to="/restaurant/dashboard" className={navItemClass}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} />
                  <span className="text-sm font-medium">Dashboard</span>
                </div>
              </NavLink>

              <NavLink to={`/restaurant/${restaurantId}/menu`} className={navItemClass}>
                <div className="flex items-center gap-3">
                  <Utensils size={18} />
                  <span className="text-sm font-medium">Menu Manager</span>
                </div>
              </NavLink>
            </>
          )}
        </nav>

        {/* Profile Section */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate capitalize">{userRole}</p>
              <p className="text-[10px] text-slate-500 font-medium">Logged In</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Online</span>
          </div>
          
          {/* <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Partner Support</p>
                <p className="text-[10px] text-indigo-600 font-medium hover:underline cursor-pointer">View Docs</p>
             </div>
          </div> */}
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50/40 p-10">
          <div className="max-w-6xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}