"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "../../../services/productService";
import { convertPrice } from "../../../utils/currency";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const currency = typeof window !== "undefined" ? localStorage.getItem("currency") || "USD" : "USD";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (!product) return <p>Loading product details...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{product.name}</h1>
      <p>Category: {product.category}</p>
      <p>
        Price: ${convertPrice(product.price, currency).toFixed(2)} {currency}
      </p>
      <p>{product.description}</p>
      {product.image && <img src={product.image} alt={product.name} width="300px" />}
    </div>
  );
};

export default ProductDetail;