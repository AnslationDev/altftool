"use client";

import React, { useState, useCallback, useContext } from "react";
import { fetchWordSuggestions } from "../utils/wordGeneratorApi";

// COMPONENTS
import DomainResults from "./DomainResults";
import DomainEmpty from "./DomainEmpty";
import DomainError from "./DomainError";
import SearchForm from "./SearchForm";
import { DomainDetailsPanel } from "./DomainDetails";
import BulkGeneratorButton from "./BulkGeneratorButton";
import SavedDomainsPanel from "./SavedDomainPanel";

// CONTEXT
import { DomainContext } from "../context/DomainContext";

const DomainGeneratorPage = () => {
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const {
    suggestions,
    setSuggestions,
    isLoading,
    setIsLoading,
    selectedDomain,
    setSelectedDomain,
    filters,
  } = useContext(DomainContext);

  const generateDomains = useCallback(
    async (e) => {
      e.preventDefault();

      if (!keyword.trim()) {
        setError("Please enter a keyword to generate domains.");
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await fetchWordSuggestions(keyword.trim(), filters);

        const normalized = results.map((s) => {
          const domain =
            typeof s === "string" ? s : s.domain || s.name;

          return {
            name: domain,
            sld: domain.split(".")[0],
            tld: domain.split(".")[1],
            category:
              typeof s === "object" ? s.category || "unknown" : "unknown",
          };
        });

        setSuggestions(normalized);

        if (normalized.length === 0) {
          setSuggestions([]);
          return;
        }
      } catch (err) {
        setError(err.message || "Failed to fetch word suggestions.");
        setSuggestions([]); // ensure clean state on error
      } finally {
        setIsLoading(false);
      }
    },
    [keyword, filters, setSuggestions, setIsLoading]
  );

  const handleCopyAll = async () => {
    try {
      const allDomains = suggestions.map((s) => s.name).join("\n");

      await navigator.clipboard.writeText(allDomains);

      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch (err) {
      console.error("Copy all failed:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* HERO */}
      <div className="text-center mb-5">
        <h1 className="heading text-center animate-fade-up mb-4">
          Domain Generator
        </h1>

        <p className="description text-center animate-fade-up">
          Generates creative, brandable domain names.
        </p>
      </div>

      {/* TOP BAR */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <BulkGeneratorButton keyword ={keyword} />
        <div className="w-full ">

          {!isLoading || !error || suggestions.length === 0 && (
            <DomainEmpty />
          )}

          <SearchForm
            keyword={keyword}
            setKeyword={setKeyword}
            onSubmit={generateDomains}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 ">
        {/* RESULTS */}
        <div className="lg:col-span-3 bg-(--background) rounded-2xl shadow-xl p-6 sm:p-8 border border-(--border)">
          
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              Generating domains...
            </div>
          ) : suggestions.length > 0 ? (
            <DomainResults
              suggestions={suggestions}
              onSelect={setSelectedDomain}
            />
          ) : (
            <DomainEmpty />
          )}

        </div>

        {/* DETAILS */}
        <div className="sticky top-6 flex flex-col gap-6 lg:col-span-2 ">
          <DomainDetailsPanel details={selectedDomain} />
          <SavedDomainsPanel />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default DomainGeneratorPage;