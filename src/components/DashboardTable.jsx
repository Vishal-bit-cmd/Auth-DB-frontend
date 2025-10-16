// src/components/DashboardTable.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardTable() {
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await api.get("/orders");
        const sorted = ordersRes.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentOrders(sorted.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-3">
      <h3>Dashboard Overview</h3>

      {/* Recent Orders */}
      <div className="mt-4">
        <h5>Recent Orders</h5>
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.order_id}>
                <td>{o.order_id}</td>
                <td>{o.customer_name}</td>
                <td>
                  <span
                    className={`badge ${
                      o.status === "delivered"
                        ? "bg-success"
                        : o.status === "shipped"
                        ? "bg-primary"
                        : o.status === "pending"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
