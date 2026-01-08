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
import AddRestaurant from "./pages/AddRestaurant";
import AddProduct from "./pages/AddProduct";
import TestUpload from "./pages/testupload";

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
              <Route path="admin/restaurants/new" element={<AddRestaurant />} /> {/* Add this */}
              <Route path="admin/restaurants/edit/:id" element={<AddRestaurant />} />
            </>
          )}



          {/* ===== RESTAURANT ROUTES ===== */}
          {userRole === "restaurant" && (
            <>
              <Route
                path="restaurant/dashboard"
                element={<RestaurantDashboard />}
              />

              {/* Menu Management Routes */}
              <Route
                path="restaurant/:rest_id/menu"
                element={<MenuManager />}
              />

              {/* Add New Product - Requires rest_id to know where to add */}
              <Route
                path="restaurant/:rest_id/menu/add"
                element={<AddProduct />}
              />

              {/* Edit Existing Product - Requires rest_id for context and product_id for fetching */}
              <Route
                path="restaurant/:rest_id/menu/edit/:product_id"
                element={<AddProduct />}
              />
              <Route path="testupload" element={<TestUpload />} />
            </>
          )}CategoryManager={}
        </Route>

        {/* ❌ FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
