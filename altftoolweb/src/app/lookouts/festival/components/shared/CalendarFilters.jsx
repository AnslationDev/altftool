"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Globe, Calendar, Tag } from "lucide-react";
import { getAllCountryCodesUsed } from "../../lib/getFestivals";
import { getCountryName } from "../../data/countryNames";
import { getMonthName } from "../../lib/dateMath";
import { CATEGORIES } from "../../data/categories";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));

export default function CalendarFilters({ initial }) {
  const countryCodes = getAllCountryCodesUsed();
  const [query, setQuery] = useState(initial.query || "");
  const [country, setCountry] = useState(initial.country || "");
  const [month, setMonth] = useState(initial.month || "");
  const [category, setCategory] = useState(initial.category || "");

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (country) params.set("country", country);
    if (month) params.set("month", month);
    if (category) params.set("category", category);
    // Hard navigation — see FestivalHero.jsx for why router.push() is
    // unreliable here (transition update that can sit pending indefinitely).
    window.location.href = `/lookouts/festival/calendar${params.toString() ? `?${params.toString()}` : ""}`;
  }

  // See FestivalHero.jsx for why this uses a native listener instead of
  // React's onSubmit prop.
  const formRef = useRef(null);
  const handleSubmitRef = useRef(handleSubmit);

  // See FestivalHero.jsx — the ref is refreshed in an effect, not during
  // render, which is unsafe under concurrent rendering.
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;
    const listener = (event) => handleSubmitRef.current(event);
    form.addEventListener("submit", listener);
    return () => form.removeEventListener("submit", listener);
  }, []);

  return (
    <form ref={formRef} className="festival-search-container festival-search-container--inline">
      <label className="festival-search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search festivals..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <label className="festival-filter-item">
        <Globe size={16} />
        <select value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Country">
          <option value="">All Countries</option>
          {countryCodes.map((code) => (
            <option key={code} value={code}>
              {getCountryName(code)}
            </option>
          ))}
        </select>
      </label>

      <label className="festival-filter-item">
        <Calendar size={16} />
        <select value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Month">
          <option value="">Any Month</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <label className="festival-filter-item">
        <Tag size={16} />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="festival-search-btn">
        Filter
      </button>
    </form>
  );
}
