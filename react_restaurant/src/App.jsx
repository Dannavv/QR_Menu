import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import MenuManager from "./pages/MenuManager";
import CategoryManager from "./pages/CategoryManager";
import Layout from "./components/Layout";
import RestaurantManager from "./pages/RestaurantManager";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const restaurantId = localStorage.getItem("restaurant_id");

  useEffect(() => {
    setUserRole(localStorage.getItem("role"));
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        {/* 🔐 LOGIN */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login setAuth={setIsAuthenticated} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 🔒 PROTECTED ROOT */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout
                setAuth={setIsAuthenticated}
                userRole={userRole}
                restaurantId={restaurantId}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          {/* 🔁 ROLE BASED REDIRECT */}
          <Route
            index
            element={
              userRole === "admin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/restaurant/dashboard" />
              )
            }
          />

          {/* ===== ADMIN ROUTES ===== */}
          {userRole === "admin" && (
            <>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="admin/restaurants" element={<RestaurantManager />} />
            </>
          )}

          {/* ===== RESTAURANT ROUTES ===== */}
          {userRole === "restaurant" && (
            <>
              <Route
                path="restaurant/dashboard"
                element={<RestaurantDashboard />}
              />
              <Route
                path="restaurant/:rest_id/menu"
                element={<MenuManager />}
              />
            </>
          )}
        </Route>

        {/* ❌ FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
