"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getProducts, getProductsByCategory } from "../../services/productService";
import { convertPrice } from "../../utils/currency";
import { CurrencyContext } from "../../contexts/CurrencyContext";

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const { currency } = useContext(CurrencyContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = category 
          ? await getProductsByCategory(category) 
          : await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [category]);

  useEffect(() => {
    // Filter products based on the search query from URL
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Marketplace</h1>
      <Link href="/">Return to Home</Link>
      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredProducts.map((product) => (
            <li
              key={product.id || product._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
              onClick={() => router.push(`/marketplace/${product._id}`)}
            >
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>
                ${convertPrice(product.price, currency).toFixed(2)} {currency}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Marketplace;