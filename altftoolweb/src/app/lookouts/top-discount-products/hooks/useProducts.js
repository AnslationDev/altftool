"use client";

import { useEffect, useState } from "react";
import { enrichProducts } from "../lib/enrich";

const API_URL =
  process.env.NEXT_PUBLIC_TOP_DEALS_API_URL || "http://127.0.0.1:8000/api/products";

/**
 * Fetches the scraped Amazon deals from the local API and enriches them.
 * Kept as its own hook (rather than inline in the landing component) so the
 * fetch/enrich/error lifecycle is testable and reusable in isolation.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setStatus("loading");
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const result = await res.json();
        const raw = Array.isArray(result) ? result : result.products || [];
        if (cancelled) return;
        setProducts(enrichProducts(raw));
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load top discount products", error);
        setProducts([]);
        setStatus("error");
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, status };
}
