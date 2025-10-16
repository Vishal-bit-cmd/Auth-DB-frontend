import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet, // 👈 Import Outlet for nested routes
} from "react-router-dom";
import { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Components
import Navbar from "./components/NavBar";
import Sidebar from "./components/SideBar";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const AppRoutes = () => {
    const { user, login, logout, loading } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 👈 Changed default to true for persistent layout

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    // const closeSidebar = () => setIsSidebarOpen(false); // 👈 Removed as it's not used in this layout

    if (loading)
      return (
        <div className="text-center mt-5 text-light">
          Checking authentication...
        </div>
      );

    // 🟢 Role-based route guard
    const ProtectedRoute = ({ children, roles }) => {
      if (!user) return <Navigate to="/login" />;
      if (roles && !roles.includes(user.role)) {
        // ... (Access Denied component remains the same)
        return (
          <div
            className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark text-light"
            style={{ textAlign: "center" }}
          >
            <h2>🚫 Access Denied</h2>
            <p>You don’t have permission to view this page.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        );
      }
      return children;
    };

    // 🟡 NEW Layout Wrapper Component
    const LayoutWrapper = () => {
      const sidebarWidth = 220;
      const navbarHeight = 60;
      const contentOffset = isSidebarOpen ? sidebarWidth : 0;

      return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          {/* 1. Sidebar - Fixed to the left */}
          <div
            style={{
              width: contentOffset,
              transition: "width 0.3s",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: "#007bff",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              userRole={user?.role} // Passing user role for dynamic links
              toggleSidebar={toggleSidebar}
            />
          </div>

          {/* 2. Main Layout Container (Right Section: Navbar + Content) */}
          <div
            style={{
              // Use margin-left and calculated width for smooth transition
              marginLeft: contentOffset,
              width: `calc(100% - ${contentOffset}px)`,
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              transition: "margin-left 0.3s, width 0.3s",
              overflow: "hidden", // Prevents horizontal scroll
            }}
          >
            {/* Navbar - Sticky to the top of the Right Section */}
            <div
              style={{
                height: navbarHeight,
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #ddd",
                position: "sticky", // Sticks to the top of its parent
                top: 0,
                zIndex: 999,
                flexShrink: 0,
              }}
            >
              <Navbar
                toggleSidebar={toggleSidebar}
                logout={logout}
                user={user}
              />
            </div>

            {/* Main Content - Takes remaining vertical space and scrolls */}
            <main
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                flex: 1,
                overflowY: "auto",
              }}
            >
              {/* Renders the nested route component (Dashboard, Products, etc.) */}
              <Outlet />
            </main>
          </div>
        </div>
      );
    };

    return (
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Protected Routes (Main Layout is applied here) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutWrapper />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes for the LayoutWrapper's Outlet */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="customers"
            element={
              <ProtectedRoute roles={["admin", "editor"]}>
                <Customers />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all for unauthenticated users, or a 404 page */}
        {!user && <Route path="*" element={<Navigate to="/login" />} />}
        {user && <Route path="*" element={<Navigate to="/dashboard" />} />}
      </Routes>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
