// src/services/orderService.ts
import axios from "axios";

const ORDER_API_URL = "http://localhost:3000/api/orders";

export const createOrder = async (orderData: any) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(ORDER_API_URL, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getOrders = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(ORDER_API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};