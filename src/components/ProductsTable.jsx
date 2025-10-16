// src/components/ProductsTable.jsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function ProductsTable() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products", {
        params: { search, category },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/products/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Role-based permissions
  const canAddOrEdit = ["admin", "editor"].includes(user?.role);
  const canDelete = user?.role === "admin";

  // Add or Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddOrEdit) return alert("Access denied");
    if (!newProduct.name || !newProduct.price || !newProduct.category_id)
      return;

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("category_id", newProduct.category_id);
    if (image) formData.append("image", image);

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setNewProduct({ name: "", price: "", category_id: "" });
      setImage(null);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleEdit = (product) => {
    if (!canAddOrEdit) return alert("Access denied");
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      category_id:
        categories.find((c) => c.name === product.category)?.id || "",
    });
    setImage(null);
  };

  const handleDelete = async (id) => {
    if (!canDelete) return alert("Admins only can delete products.");
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="p-3">
      <h3>Products</h3>

      {/* Search + Filter */}
      <div className="d-flex mb-3 gap-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select w-25"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit Product Form (Hidden for Viewers) */}
      {canAddOrEdit && (
        <form className="mb-4" onSubmit={handleSubmit}>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              type="number"
              className="form-control"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />

            <select
              className="form-select"
              value={newProduct.category_id}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category_id: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="file"
              className="form-control"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <button className="btn btn-primary" type="submit">
              {editingProduct ? "Update" : "Add"}
            </button>
            {editingProduct && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({ name: "", price: "", category_id: "" });
                  setImage(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Products Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Image</th>
            {(canAddOrEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.category}</td>
                <td>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      width="50"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    "No image"
                  )}
                </td>
                {(canAddOrEdit || canDelete) && (
                  <td>
                    {canAddOrEdit && (
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id)}
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
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
