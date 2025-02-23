// pages/index.tsx
import React from "react";
import Link from "next/link";

const Home: React.FC = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Hello World!</h1>
      <p>Welcome to your Overgear Clone project.</p>
      <Link href="/marketplace">Go to Marketplace</Link>
    </div>
  );
};

export default Home;