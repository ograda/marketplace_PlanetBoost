"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, register } from "../services/authService";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { CartContext } from "../contexts/CartContext";

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
  const { cart } = useContext(CartContext);

  // On mount, check for auth state in localStorage
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
    router.push("/"); // Redirect to home page
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const curr = e.target.value;
    setCurrency(curr);
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
    <Link href="/">Casa do Macacao</Link>
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
      
      {/* Cart icon with count */}
      <Link href="/cart" style={{ position: "relative" }}>
        🛒
        {cart.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-10px",
              background: "red",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
            }}
          >
            {cart.length}
          </span>
        )}
      </Link>
      {isAuthenticated ? (
        <>
          <Link href="/profile" style={{ color: "#fff" }}>
            Profile
          </Link>
          <button onClick={handleLogout} style={{ background: "#555", color: "#fff", padding: "5px 10px", border: "none" }}>
            Logout
          </button>
        </>
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
