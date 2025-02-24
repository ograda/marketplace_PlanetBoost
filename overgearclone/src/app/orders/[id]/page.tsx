"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const OrderDetail: React.FC = () => {
  const { id } = useParams(); // id from URL
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        router.replace("/profile");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/profile");
          return;
        }
        const response = await axios.get(`http://localhost:3000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // If no order is found, redirect
        if (!response.data) {
          router.replace("/profile");
          return;
        }
        setOrder(response.data);
      } catch (err: any) {
        // If error is 404 or 403, redirect to profile
        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
          router.replace("/profile");
        } else {
          console.error("Error fetching order:", err);
          router.replace("/profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (loading) return <p>Loading order details...</p>;
  if (!order) return null; // In case order is not available, nothing is rendered

  return (
    <div style={{ padding: "20px" }}>
      <h1>Order Details</h1>
      <p>
        <strong>Order ID:</strong> {order.id}
      </p>
      <p>
        <strong>Total:</strong>{" "}
        {order.total !== undefined ? `$${order.total.toFixed(2)}` : "$0.00"}
      </p>
      <p>
        <strong>Status:</strong> {order.orderStatus}
      </p>
      <p>
        <strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}
      </p>
      <h2>Items:</h2>
      <ul>
        {order.items.map((item: any) => (
          <li key={item.id}>
            {item.product ? item.product.name : `Product ${item.productId}`} - Quantity: {item.quantity} - Unit Price: ${item.unitPrice.toFixed(2)}
          </li>
        ))}
      </ul>
      <button onClick={() => router.push("/profile")} style={{ marginTop: "20px", padding: "8px 16px" }}>
        Go Back to Profile
      </button>
    </div>
  );
};

export default OrderDetail;
