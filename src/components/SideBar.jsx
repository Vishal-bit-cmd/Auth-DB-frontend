import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Sidebar() {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile", { withCredentials: true });
        setUserRole(res.data.role);
      } catch (err) {
        console.error("Error loading user role:", err);
      }
    };
    fetchProfile();
  }, []);

  const links = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/users", label: "Users", roles: ["admin"] },
    { path: "/customers", label: "Customers" },
    { path: "/products", label: "Products" },
    { path: "/orders", label: "Orders" },
  ];

  return (
    <div
      className="sidebar bg-primary text-white vh-100"
      style={{ width: "220px" }}
    >
      <ul className="nav flex-column mt-3">
        {links.map(
          (link) =>
            (!link.roles || link.roles.includes(userRole)) && (
              <li className="nav-item" key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link text-white ${
                    location.pathname === link.path
                      ? "fw-bold bg-blue rounded"
                      : ""
                  }`}
                  style={{ padding: "12px 20px" }}
                >
                  {link.label}
                </Link>
              </li>
            )
        )}
      </ul>
    </div>
  );
}
