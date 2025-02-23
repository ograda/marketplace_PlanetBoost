import axios from "axios";

const API_URL = "http://localhost:3000/api/products";

// Fetch all products
export const getProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Fetch products by category
export const getProductsByCategory = async (category: string) => {
  const url = category ? `${API_URL}?category=${encodeURIComponent(category)}` : API_URL;
  const response = await axios.get(url);
  return response.data;
};

// Add a new product
export const addProduct = async (product: any) => {
  const response = await axios.post(API_URL, product);
  return response.data;
};

// Delete a product
export const deleteProduct = async (id: string) => {
  const response = await axios.delete(API_URL, { data: { id } });
  console.log("Delete response:", response.data);
  return response.data;
};

// Fetch single product by ID
export const getProductById = async (id: string | string[] | undefined) => {
  if (!id) throw new Error("Product ID is required");
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};