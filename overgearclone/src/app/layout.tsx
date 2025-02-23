// src/app/layout.tsx
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import React from "react";

export const metadata = {
  title: "Overgear Clone",
  description: "Marketplace for gaming services",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <Navbar />
          <main>{children}</main>
        </CurrencyProvider>
      </body>
    </html>
  );
}
