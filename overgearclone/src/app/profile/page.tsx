"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrders } from "../../services/orderService";
import axios from "axios";

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchOrders();
    }
  }, [router]);

  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  if (!user) return <p>Loading your profile...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Profile</h1>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`}>
                Order #{order.id} - Total: ${order.total.toFixed(2)} -{" "}
                {new Date(order.createdAt).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;