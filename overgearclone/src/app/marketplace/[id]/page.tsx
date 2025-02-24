"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "../../../services/productService";
import { convertPrice } from "../../../utils/currency";
import { CurrencyContext } from "../../../contexts/CurrencyContext";
import { CartContext } from "../../../contexts/CartContext";
import { getProductImagePath } from "../../../utils/imagePath";
const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const { currency } = useContext(CurrencyContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading product details...</p>;

  const handleAddToCart = () => {
    // Add the product with a quantity of 1
    addToCart({ productId: product.id || product._id, quantity: 1, name: product.name, price: product.price, image: product.image });
    alert("Product added to cart!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>{product.name}</h1>
      <p>Category: {product.category}</p>
      <p>
        Price: ${convertPrice(product.price, currency).toFixed(2)} {currency}
      </p>
      <p>{product.description}</p>
      {product.image &&               <img
                      src={getProductImagePath(product.image)}
                      alt={product.name}
                      style={{ width: "300px", height: "auto" }}
                    />}
      <button onClick={handleAddToCart} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetail;