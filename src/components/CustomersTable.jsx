// src/components/tables/CustomersTable.jsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function CustomersTable() {
  const { user } = useContext(AuthContext);

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  // Form states
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = async (searchValue = "") => {
    try {
      const res = await api.get("/customers", {
        params: { search: searchValue },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const canAddOrEdit = user?.role === "admin" || user?.role === "editor";
  const canDelete = user?.role === "admin";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchCustomers(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddOrEdit) return alert("Access denied");
    if (!form.name || !form.email) return alert("Name and Email are required");

    try {
      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer.id}`,
          form
        );
      } else {
        await api.post("/customers", form);
      }

      setForm({ name: "", email: "", phone: "" });
      setEditingCustomer(null);
      fetchCustomers(search);
    } catch (err) {
      console.error("Error saving customer:", err);
    }
  };

  const handleEdit = (customer) => {
    if (!canAddOrEdit) return alert("Access denied");
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
    });
  };

  const handleDelete = async (id) => {
    if (!canDelete) return alert("Admins only can delete customers.");
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;

    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers(search);
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <div className="p-3">
      <h3>Customers</h3>

      {/* Search Bar */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name or email"
        value={search}
        onChange={handleSearchChange}
      />

      {/* Add/Edit Form */}
      {canAddOrEdit && (
        <div className="card p-3 mb-4">
          <h5>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h5>
          <form className="row g-2" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="col-md-1 d-flex gap-1">
              <button type="submit" className="btn btn-primary w-100">
                {editingCustomer ? "Update" : "Add"}
              </button>
              {editingCustomer && (
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={() => {
                    setEditingCustomer(null);
                    setForm({ name: "", email: "", phone: "" });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Customers Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Created At</th>
            {(canAddOrEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                {(canAddOrEdit || canDelete) && (
                  <td>
                    {canAddOrEdit && (
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(c.id)}
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
              <td colSpan={6} className="text-center">
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
