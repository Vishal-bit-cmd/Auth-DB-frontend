import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function UsersTable() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [editingUser, setEditingUser] = useState(null);

  // 🔹 Fetch users (Admin only)
  const fetchUsers = async () => {
    if (!user || user.role !== "admin") return;

    try {
      const res = await api.get("/users", {
        params: { search, role: roleFilter },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="p-3">
        <h3>Users</h3>
        <p className="text-danger">You do not have access to manage users.</p>
      </div>
    );
  }

  // 🔹 Add or Edit User
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newUser.username ||
      !newUser.email ||
      (!editingUser && !newUser.password) ||
      !newUser.role
    )
      return;

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        });
      } else {
        await api.post("/users", newUser);
      }

      setNewUser({ username: "", email: "", password: "", role: "" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("❌ Error saving user:", err);
    }
  };

  // 🔹 Edit
  const handleEdit = (u) => {
    setEditingUser(u);
    setNewUser({
      username: u.username,
      email: u.email,
      password: "",
      role: u.role,
    });
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  return (
    <div className="p-3">
      <h3>Users</h3>

      {/* 🔍 Search + Filter */}
      <div className="d-flex gap-3 mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select w-25"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* ✏️ Add/Edit User */}
      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
          />
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          {!editingUser && (
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          )}
          <select
            className="form-select"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button className="btn btn-primary" type="submit">
            {editingUser ? "Update" : "Add"}
          </button>
          {editingUser && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingUser(null);
                setNewUser({ username: "", email: "", password: "", role: "" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* 📋 Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={`badge ${
                      u.role === "admin"
                        ? "bg-primary"
                        : u.role === "editor"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(u)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
