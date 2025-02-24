"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartContext } from "../../contexts/CartContext";
import { CurrencyContext } from "../../contexts/CurrencyContext";
import { convertPrice } from "../../utils/currency";
import { createOrder } from "../../services/orderService";

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const { currency } = useContext(CurrencyContext);
  const router = useRouter();

  // Calculate overall total from cart items
  const overallTotal = cart.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Define checkoutCart function
  const checkoutCart = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Please log in to checkout.");
      return;
    }
    const user = JSON.parse(userData);
    // Prepare order items based on cart items
    const orderItems = cart.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      unitPrice: Number(item.price), // ensure it's a number
    }));
  
    console.log("Checkout user id (client):", user.id); // Log the user id on client
    console.log("Checkout orderItems:", orderItems); // Debug log
  
    try {
      const order = await createOrder({ userId: user.id, items: orderItems });
      alert("Order placed successfully!");
      clearCart();
      router.push(`/order/${order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to place order.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.map((item) => {
              const unitPriceConverted = convertPrice(item.price || 0, currency);
              const totalPriceConverted = unitPriceConverted * item.quantity;
              return (
                <li key={item.productId} style={{ marginBottom: "10px" }}>
                  <strong>{item.name}</strong> - Quantity: {item.quantity} - Unit Price: $
                  {unitPriceConverted.toFixed(2)} {currency} - Total: $
                  {totalPriceConverted.toFixed(2)} {currency}
                  <button onClick={() => removeFromCart(item.productId)} style={{ marginLeft: "10px" }}>
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <p>
            <strong>Overall Total:</strong> ${convertPrice(overallTotal, currency).toFixed(2)} {currency}
          </p>
          <button onClick={clearCart} style={{ padding: "5px 10px" }}>
            Clear Cart
          </button>
          <button onClick={checkoutCart} style={{ marginLeft: "10px", padding: "5px 10px" }}>
            Checkout
          </button>
        </>
      )}
      <Link href="/marketplace">Continue Shopping</Link>
    </div>
  );
};

export default CartPage;