"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, register } from "../services/authService";
import { CurrencyContext } from "../contexts/CurrencyContext";

const Navbar: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { currency, setCurrency } = useContext(CurrencyContext);

  // On mount, check localStorage for authentication state
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchInput(query);
    // For example, update the marketplace URL with the search query:
    router.push(`/marketplace?search=${encodeURIComponent(query)}`);
  };

  const toggleAuthModal = () => {
    setShowAuthModal((prev) => !prev);
    setAuthError("");
  };

  const handleToggleForm = () => {
    setIsRegister((prev) => !prev);
    setAuthError("");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (isRegister) {
        if (!username) {
          setAuthError("Username is required for registration");
          return;
        }
        res = await register(username, email, password);
      } else {
        res = await login(email, password);
      }
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        setIsAuthenticated(true);
        setUser(res.user);
        setShowAuthModal(false);
        router.refresh();
      } else {
        setAuthError("Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError("Invalid credentials or registration error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    router.refresh();
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const curr = e.target.value;
    setCurrency(curr);
    // CurrencyContext will update localStorage and trigger re-renders in consumer components
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        padding: "10px",
        background: "#333",
        color: "#fff",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={handleSearchChange}
          style={{ padding: "5px", width: "200px" }}
        />
        <span style={{ marginLeft: "5px" }}>🔍</span>
      </div>
      <select value={currency} onChange={handleCurrencyChange} style={{ padding: "5px" }}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="BRL">BRL</option>
      </select>
      <Link href="/marketplace">Marketplace</Link>
      {isAuthenticated ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} style={{ background: "#555", color: "#fff", padding: "5px 10px", border: "none" }}>
            Logout
          </button>
        </div>
      ) : (
        <button onClick={toggleAuthModal} style={{ background: "#555", color: "#fff", padding: "5px 10px", border: "none" }}>
          Login
        </button>
      )}
      {showAuthModal && !isAuthenticated && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "10px",
            background: "#fff",
            color: "#000",
            padding: "10px",
            border: "1px solid #ccc",
            zIndex: 1000,
          }}
        >
          <form onSubmit={handleAuthSubmit}>
            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ marginBottom: "5px", padding: "5px", width: "200px" }}
                />
                <br />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginBottom: "5px", padding: "5px", width: "200px" }}
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ marginBottom: "5px", padding: "5px", width: "200px" }}
            />
            <br />
            <button type="submit" style={{ padding: "5px 10px" }}>
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
          {authError && <p style={{ color: "red" }}>{authError}</p>}
          <p style={{ marginTop: "10px" }}>
            {isRegister ? "Already have an account?" : "New user?"}{" "}
            <button
              onClick={handleToggleForm}
              style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
            >
              {isRegister ? "Login" : "Create an account"}
            </button>
          </p>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
