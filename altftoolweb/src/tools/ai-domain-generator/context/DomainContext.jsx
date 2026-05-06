"use client";

import React, { createContext, useState, useEffect, useMemo } from "react";

export const DomainContext = createContext();

const loadStoredList = (key) => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (err) {
    console.error("LocalStorage parse error:", err);
    return [];
  }
};

export const DomainProvider = ({ children }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [savedDomains, setSavedDomains] = useState(() =>
    loadStoredList("savedDomains")
  );
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [searchHistory, setSearchHistory] = useState(() =>
    loadStoredList("searchHistory")
  );
  const [filters, setFilters] = useState({
    length: "all",
    category: "all",
    tlds: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync savedDomains to localStorage
  useEffect(() => {
    localStorage.setItem("savedDomains", JSON.stringify(savedDomains));
  }, [savedDomains]);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Add domain
  const saveDomain = (domain) => {
    setSavedDomains((prev) =>
      prev.includes(domain) ? prev : [...prev, domain]
    );
  };

  // Remove domain
  const removeDomain = (domain) => {
    setSavedDomains((prev) => prev.filter((d) => d !== domain));
  };

  // Search history
  const addToHistory = (keyword) => {
    setSearchHistory((prev) => {
      const newHistory = [keyword, ...prev.filter((k) => k !== keyword)];
      return newHistory.slice(0, 10);
    });
  };

  // Compute filteredSuggestions for live filtering
  const filteredSuggestions = useMemo(() => {
    const isFilterActive =
      filters.category !== "all" ||
      filters.length !== "all" ||
      (filters.tlds && filters.tlds.length > 0);

    if (!isFilterActive) return suggestions;

    return suggestions.filter((domain) => {
      // ✅ Defensive checks (prevents everything being filtered out)
      if (!domain) return false;

      const name =
        typeof domain === "string"
          ? domain
          : domain.name || domain.domain;

      const tld =
        typeof domain === "string"
          ? domain.split(".")[1]
          : domain.tld;

      if (!name || !tld) return false;

      const domainCategory =
        typeof domain === "object" ? domain.category || "unknown" : "unknown";

      const domainTld = tld.toLowerCase();

      const categoryMatch =
        filters.category === "all" || domainCategory === filters.category;

      const nameLength = name.length;
      const lengthMatch =
        filters.length === "all" ||
        (filters.length === "short" && nameLength >= 3 && nameLength <= 6) ||
        (filters.length === "medium" && nameLength > 6 && nameLength <= 10) ||
        (filters.length === "long" && nameLength > 10);

      const normalizedFilterTlds = (filters.tlds || []).map((t) =>
        t.replace(".", "").toLowerCase()
      );

      const tldMatch =
        normalizedFilterTlds.length === 0 ||
        normalizedFilterTlds.includes(domainTld);

      return categoryMatch && lengthMatch && tldMatch;
    });
  }, [suggestions, filters]);

  return (
    <DomainContext.Provider
      value={{
        suggestions,
        setSuggestions,
        filteredSuggestions,
        savedDomains,
        saveDomain,
        removeDomain,
        selectedDomain,
        setSelectedDomain,
        searchHistory,
        addToHistory,
        filters,
        setFilters,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DomainContext.Provider>
  );
};
