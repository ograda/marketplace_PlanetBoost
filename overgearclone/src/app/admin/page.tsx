"use client";

import React, { useState, useEffect } from "react";
import { getProducts, addProduct, deleteProduct } from "../../services/productService";
import { convertPrice } from "../../utils/currency";
import { useContext } from "react";
import { CurrencyContext } from "../../contexts/CurrencyContext";

const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
  });
  const { currency } = useContext(CurrencyContext);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data); // initially, no filtering
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on the search query
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct({
        ...formData,
        price: parseFloat(formData.price),
      });
      alert("Product added!");
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. A product with the same name might exist.");
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    console.log("Deleting product with id:", id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel</h1>

      {/* Search Input */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "5px", width: "250px" }}
        />
        <span style={{ marginLeft: "5px" }}>🔍</span>
      </div>

      {/* Form to Add a Product */}
      <form onSubmit={handleAddProduct} style={{ marginBottom: "20px" }}>
        <input type="text" placeholder="Product Name" name="name" value={formData.name} onChange={handleChange} required />
        <input type="text" placeholder="Category" name="category" value={formData.category} onChange={handleChange} required />
        <input type="number" placeholder="Price" name="price" value={formData.price} onChange={handleChange} required />
        <input type="text" placeholder="Image URL" name="image" value={formData.image} onChange={handleChange} />
        <textarea placeholder="Description" name="description" value={formData.description} onChange={handleChange}></textarea>
        <button type="submit">Add Product</button>
      </form>

      {/* Existing Products List */}
      <h2>Existing Products</h2>
      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {filteredProducts.map((product, index) => (
            <li key={product.id || product._id || index}>
              <h3>{product.name}</h3>
              <p>
                Price: ${convertPrice(product.price, currency).toFixed(2)} {currency}
              </p>
              <button onClick={() => handleDeleteProduct(product.id || product._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;