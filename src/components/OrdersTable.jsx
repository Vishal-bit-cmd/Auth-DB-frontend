// src/components/tables/OrdersTable.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function OrdersTable() {
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [newOrder, setNewOrder] = useState({
    customer_id: "",
    status: "pending",
  });
  const [editingOrder, setEditingOrder] = useState(null);

  const orderStatuses = ["pending", "shipped", "delivered", "cancelled"];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders", {
        params: { search, status },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, status]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Role-based permissions
  const canAddOrEdit = ["admin", "editor"].includes(user?.role);
  const canDelete = user?.role === "admin";

  // Add / Update order
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddOrEdit) return alert("Access denied");
    if (!newOrder.customer_id || !newOrder.status) return;

    try {
      if (editingOrder) {
        await api.put(`/orders/${editingOrder.order_id}`, newOrder);
      } else {
        await api.post("/orders", newOrder);
      }
      setNewOrder({ customer_id: "", status: "pending" });
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Error saving order:", err);
    }
  };

  const handleEdit = (order) => {
    if (!canAddOrEdit) return alert("Access denied");
    setEditingOrder(order);
    setNewOrder({
      customer_id:
        customers.find((c) => c.name === order.customer_name)?.id || "",
      status: order.status,
    });
  };

  const handleDelete = async (id) => {
    if (!canDelete) return alert("Admins only can delete orders.");
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  return (
    <div className="p-3">
      <h3>Orders</h3>

      {/* Search + Status Filter */}
      <div className="d-flex mb-3 gap-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search orders"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select w-25"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {orderStatuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit Order Form */}
      {canAddOrEdit && (
        <form className="mb-4" onSubmit={handleSubmit}>
          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={newOrder.customer_id}
              onChange={(e) =>
                setNewOrder({ ...newOrder, customer_id: e.target.value })
              }
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>

            <select
              className="form-select"
              value={newOrder.status}
              onChange={(e) =>
                setNewOrder({ ...newOrder, status: e.target.value })
              }
            >
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <button className="btn btn-primary" type="submit">
              {editingOrder ? "Update" : "Add"}
            </button>
            {editingOrder && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingOrder(null);
                  setNewOrder({ customer_id: "", status: "pending" });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Orders Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Status</th>
            <th>Created At</th>
            {(canAddOrEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o.order_id}>
                <td>{o.order_id}</td>
                <td>{o.customer_name}</td>
                <td>{o.customer_email}</td>
                <td>
                  <span
                    className={`badge ${
                      o.status === "pending"
                        ? "bg-secondary"
                        : o.status === "shipped"
                        ? "bg-primary"
                        : o.status === "delivered"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                {(canAddOrEdit || canDelete) && (
                  <td>
                    {canAddOrEdit && (
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(o)}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(o.order_id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}