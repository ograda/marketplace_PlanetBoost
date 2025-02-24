// src/app/layout.tsx
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import ChatBot from "../components/Chatbot";
import React from "react";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import { CartProvider } from "../contexts/CartContext";

export const metadata = {
  title: "Overgear Clone",
  description: "Marketplace for gaming services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <CartProvider>
            <Navbar />
            <ChatBot />
            <main>{children}</main>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}