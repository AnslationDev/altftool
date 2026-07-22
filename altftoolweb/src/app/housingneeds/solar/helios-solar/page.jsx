"use client";

import { useEffect, useState } from "react";
import App from "./App";
import "./helios.css";

export default function HeliosSolarPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#000" }} />;
  }

  return <App />;
}
