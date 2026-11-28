

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  brand: string | null;
  category: string;
  imageUrl: string | null;
  stock: number;
}

const API_URL = "http://localhost:3001/products";
const BACKEND_URL = "http://localhost:3001";

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  padding: "12px 20px",
  marginTop: "15px",
  background: "#68458c",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    category: "Optical",
    imageUrl: "",
    stock: "0",
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Optical");
  const [imageUrl, setImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [stock, setStock] = useState("0");

  // Load products from the backend
  async function fetchProducts() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load products.");
      }

      const data: Product[] = await response.json();
      setProducts(data);
      setError("");
    } catch {
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load products.");
        }

        const data: Product[] = await response.json();

        if (!controller.signal.aborted) {
          setProducts(data);
          setError("");
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to connect to the backend.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  // Delete product
  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );

      setMessage("Product deleted successfully!");
    } catch {
      setMessage("Unable to delete this product.");
    }
  }

  // Start editing a product
  function startEditing(product: Product) {
    setEditingId(product.id);

    setEditForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      brand: product.brand || "",
      category: product.category,
      imageUrl: product.imageUrl || "",
      stock: String(product.stock),
    });

    setMessage("");
  }

  // Update product
  async function updateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (editingId === null) return;

    if (
      !editForm.name.trim() ||
      !editForm.description.trim() ||
      Number(editForm.price) <= 0
    ) {
      setMessage("Please enter valid product information.");
      return;
    }

    if (
      !Number.isInteger(Number(editForm.stock)) ||
      Number(editForm.stock) < 0
    ) {
      setMessage("Stock must be a non-negative whole number.");
      return;
    }

    setEditSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          price: Number(editForm.price),
          brand: editForm.brand.trim() || undefined,
          category: editForm.category,
          imageUrl: editForm.imageUrl.trim() || undefined,
          stock: Number(editForm.stock),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product.");
      }

      const updatedProduct: Product = await response.json();

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingId ? updatedProduct : product
        )
      );

      setEditingId(null);
      setMessage("Product updated successfully!");
    } catch {
      setMessage("Unable to update product.");
    } finally {
      setEditSaving(false);
    }
  }

  // Validate and preview selected image
  function handleNewImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setMessage("");

    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  }

  // Add product and upload its image
  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !description.trim() || Number(price) <= 0) {
      setMessage("Please enter valid product information.");
      return;
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setMessage("Stock must be a non-negative whole number.");
      return;
    }

    setSaving(true);

    try {
      // 1. Create product
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          brand: brand.trim() || undefined,
          category,
          stock: Number(stock),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to add product.");
      }

      const createdProduct: Product = await response.json();

      // 2. Upload image if one was selected
      if (newImageFile) {
        const formData = new FormData();
        formData.append("image", newImageFile);

        const uploadResponse = await fetch(
          `${API_URL}/${createdProduct.id}/image`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          await fetchProducts();

          setMessage(
            "Product created, but image upload failed. Please check the backend."
          );

          return;
        }
      }

      // 3. Refresh product list
      await fetchProducts();

      // 4. Reset form
      setName("");
      setDescription("");
      setPrice("");
      setBrand("");
      setCategory("Optical");
      setImageUrl("");
      setStock("0");
      setNewImageFile(null);
      setNewImagePreview("");

      setMessage("Product added successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to add product. Please check your backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        padding: "40px",
        background: "#f7f5fa",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#68458c" }}>Violette Optic</h1>
          <p>Administration Dashboard</p>
        </div>

        <Link href="/" style={{ color: "#68458c" }}>
          View Customer Shop
        </Link>
      </header>

      <h2 style={{ marginTop: "40px" }}>Manage Products</h2>

      {/* ADD PRODUCT */}
      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "600px",
          marginTop: "20px",
        }}
      >
        <h3>Add a New Product</h3>

        <form onSubmit={addProduct}>
          <input
            required
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <textarea
            required
            placeholder="Product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: "100px" }}
          />

          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Price (TND)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Brand (e.g. Ray-Ban)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={inputStyle}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="Optical">Optical</option>
            <option value="Sunglasses">Sunglasses</option>
          </select>

          <label style={{ display: "block", marginTop: "15px" }}>
            Product Image

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleNewImageChange}
              style={inputStyle}
            />
          </label>

          {newImagePreview && (
            <div style={{ marginTop: "15px" }}>
              <p>Image Preview:</p>

              <img
                src={newImagePreview}
                alt="Product preview"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}

          <input
            required
            type="number"
            min="0"
            step="1"
            placeholder="Stock quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              ...buttonStyle,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Adding..." : "Add Product"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "15px" }}>{message}</p>
        )}
      </section>

      {/* PRODUCT LIST */}
      <section style={{ marginTop: "40px" }}>
        <h2>Products ({products.length})</h2>

        {loading && <p>Loading products...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products found.</p>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "220px" }}>
              {editingId === product.id ? (
                <form onSubmit={updateProduct}>
                  <h3>Edit Product</h3>

                  <input
                    required
                    placeholder="Product name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />

                  <textarea
                    required
                    placeholder="Description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                    style={{
                      ...inputStyle,
                      minHeight: "90px",
                    }}
                  />

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Price"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />

                  <input
                    placeholder="Brand"
                    value={editForm.brand}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        brand: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />

                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        category: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="Optical">Optical</option>
                    <option value="Sunglasses">Sunglasses</option>
                  </select>

                  <input
                    placeholder="Image URL"
                    value={editForm.imageUrl}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        imageUrl: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />

                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Stock"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        stock: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />

                  <button
                    type="submit"
                    disabled={editSaving}
                    style={buttonStyle}
                  >
                    {editSaving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    style={{
                      ...buttonStyle,
                      background: "#777",
                      marginLeft: "10px",
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h3>{product.name}</h3>

                  <p>
                    {product.brand || "No brand"} — {product.category}
                  </p>

                  <p>{product.price} TND</p>

                  <p>Stock: {product.stock}</p>

                  <button
                    type="button"
                    onClick={() => startEditing(product)}
                    style={buttonStyle}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                    style={{
                      ...buttonStyle,
                      background: "#b83250",
                      marginLeft: "10px",
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {/* PRODUCT IMAGE */}
            {product.imageUrl && (
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f7f5fa",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={
                    product.imageUrl.startsWith("http")
                      ? product.imageUrl
                      : `${BACKEND_URL}${product.imageUrl}`
                  }
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
