import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import Sidebar from "./SideBar";
import api from "../services/api";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await api.get("/auth/profile", { withCredentials: true });
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        navigate("/login");
      }
    };
    verifyUser();
  }, [navigate]);

  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    navigate("/login");
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  const sidebarWidth = 220; // Sidebar width
  const navbarHeight = 60; // Navbar height

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? sidebarWidth : 0,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: "#007bff",
          overflowY: "auto",
          transition: "width 0.3s",
          zIndex: 1000,
        }}
      >
        <Sidebar
          isOpen={sidebarOpen}
          userRole={user?.role}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Right Section */}
      <div
        style={{
          marginLeft: contentOffset(),
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Navbar */}
        <div
          style={{
            height: navbarHeight,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #ddd",
            zIndex: 999,
            flexShrink: 0,
          }}
        >
          <Navbar toggleSidebar={toggleSidebar} logout={logout} user={user} />
        </div>

        {/* Main Content */}
        <main
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
