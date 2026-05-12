'use client'
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, UserCircle2, Gem } from "lucide-react";
import {
  getOriginLabel,
  getMeaning,
  getDescription,
  getVariations,
  getCommonSurname,
  getPartnerName,
  getPeakYear,
  getFunFact,
} from "../utils/nameGenerator.jsx";
import { AncestorSearchPanel } from "../components/AncestorSearchPanel";
import { COUNTRY_NAMES } from "../utils/constants.jsx";
import dynamic from "next/dynamic";
const AncestorOriginMap = dynamic(() => import("../components/AncestorOriginMap").then(mod => mod.AncestorOriginMap), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

// ============================================
// SAFE HELPERS - Convert anything to string
// ============================================
function safeString(value) {
  if (!value) return "";
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    return value.definition || value.meaning || value.origin || value.name || value.label || JSON.stringify(value);
  }
  return String(value);
}

function safeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    if (Array.isArray(value.variations)) return value.variations;
    if (Array.isArray(value.usages)) return value.usages.map(u => typeof u === 'object' ? u.usage_full || u.name : u);
    if (Array.isArray(value.cultures)) return value.cultures;
  }
  return [];
}

function titleCase(s) {
  if (!s) return "";
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function inferCountryFromOrigin(originRaw) {
  const o = safeString(originRaw).toLowerCase();
  if (!o) return null;
  if (o.includes("indian") || o.includes("sanskrit") || o.includes("hindu") || o.includes("hindi") || o.includes("bengali") || o.includes("punjabi") || o.includes("tamil") || o.includes("telugu") || o.includes("marathi")) return "IN";
  if (o.includes("english") || o.includes("british")) return "GB";
  if (o.includes("american") || o.includes("united states")) return "US";
  if (o.includes("irish") || o.includes("gaelic")) return "IE";
  if (o.includes("french")) return "FR";
  if (o.includes("german")) return "DE";
  if (o.includes("italian")) return "IT";
  if (o.includes("spanish")) return "ES";
  if (o.includes("arabic") || o.includes("islamic") || o.includes("muslim")) return "SA";
  if (o.includes("hebrew") || o.includes("jewish")) return "IL";
  if (o.includes("japanese")) return "JP";
  if (o.includes("chinese")) return "CN";
  if (o.includes("korean")) return "KR";
  if (o.includes("russian")) return "RU";

  // Name suffix based inference for Indian names
  const name = safeString(originRaw).toLowerCase();
  if (name.endsWith("aj") || name.endsWith("esh") || name.endsWith("kumar") || name.endsWith("deep") || name.endsWith("jeet") || name.endsWith("vinder") || name.endsWith("sharma") || name.endsWith("singh") || name.endsWith("patel") || name.endsWith("ul") || name.endsWith("an") || name.endsWith("am") || name.endsWith("ya")) return "IN";

  return null;
}

function formatSourceLabel(source) {
  const map = {
    "behindthename.com": "BehindTheName",
    "wikipedia.org": "Wikipedia",
    "wiktionary.org": "Wiktionary",
    "nationalize.io": "Nationalize",
    "agify.io": "Agify",
    "demographic_analysis": "Demographic Analysis",
  };
  return map[source] || source;
}

function getNationalizeOrigin(data) {
  const topCountry = data?.nationality?.country?.[0];
  if (!topCountry?.country_id) return null;

  const countryId = topCountry.country_id;
  const countryName = COUNTRY_NAMES[countryId] || countryId;
  const probability = topCountry.probability ? Math.round(topCountry.probability * 100) : 0;

  return {
    countryId,
    countryName,
    probability,
  };
}

function AncestorDataSourceChips({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {sources.map((source) => (
        <span
          key={source}
          className="inline-flex items-center rounded-full border border-[#d3dbcf] bg-[#eef5ea] px-3 py-1 text-xs font-medium text-[#2e5a2f]"
        >
          {formatSourceLabel(source)}
        </span>
      ))}
    </div>
  );
}

function AncestorPremiumInsight({ name, origin, meaning, variations }) {
  const n = safeString(name);
  let o = safeString(origin);
  if (o === "Unknown" || !o) {
    const inferredId = inferCountryFromOrigin(n);
    o = inferredId ? COUNTRY_NAMES[inferredId] : "Unknown";
  }
  const m = safeString(meaning) || "A name with rich cultural heritage";
  const v = safeArray(variations);

  const variationText = v.length ? v.slice(0, 4).join(", ") : "Not available";

  // Check if dark mode is active from a global prop or context if possible, 
  // but since we are in a sub-component, we can use a small hook or detect from class.
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    checkDark();
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-[#f7f7f5] pb-8 dark:bg-(--background) transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6">
        <div 
          className="rounded-2xl border p-6 shadow-sm transition-all duration-500"
          style={{
            background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #f6fbf4 0%, #ffffff 100%)',
            borderColor: isDark ? '#334155' : '#d8e2d2'
          }}
        >
          <div 
            className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase"
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#e7f3e2',
              color: isDark ? '#34d399' : '#235b18'
            }}
          >
            Premium Name Insight
          </div>
          <p 
            className="leading-7 font-medium"
            style={{ color: isDark ? '#f1f5f9' : '#2c2c2b' }}
          >
            <span className="font-bold" style={{ color: isDark ? '#ffffff' : '#000000' }}>{n}</span> is associated with <span style={{ color: isDark ? '#10b981' : '#1f6a07', fontWeight: 700 }}>{o}</span> origin.
            <br />
            <span className="opacity-90">Meaning: {m}</span>
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 text-sm">
            <div 
              className="rounded-xl border p-4 transition-colors duration-500"
              style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e3eadf'
              }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] font-black" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Variations</p>
              <p className="mt-2 font-bold" style={{ color: isDark ? '#38bdf8' : '#2f6f97' }}>{variationText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AncestorNationalizeOriginBlock({ data }) {
  const origin = getNationalizeOrigin(data);
  if (!origin) return null;

  return (
    <section className="bg-[#f7f7f5] pb-8 dark:bg-(--background)">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-2xl border border-[#d8e2d2] bg-white p-5 shadow-sm dark:border-(--border) dark:bg-(--muted)">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#6a6a64] dark:text-(--muted-foreground)">
            Nationalize.io origin
          </p>
          <p className="mt-2 text-lg font-semibold text-[#2f2f2e] dark:text-(--foreground)">
            {origin.countryName}
          </p>
          <p className="mt-1 text-sm text-[#5f5f5e] dark:text-(--secondary-foreground)">
            Strongest geographic match for this name{origin.probability > 0 ? ` (${origin.probability}%)` : ""}.
          </p>
        </div>
      </div>
    </section>
  );
}

function countryToFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

function AncestorHeroMeaning({ name, data }) {
  const countries = data?.nationality?.country || [];
  const topThree = countries.slice(0, 3).map(c => ({
    code: c.country_id,
    name: COUNTRY_NAMES[c.country_id] || c.country_id,
    pct: Math.round((c.probability || 0) * 100),
    flag: countryToFlag(c.country_id)
  }));

  return (
    <section className="bg-white dark:bg-(--background) pt-8 pb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative flex flex-col items-center">
          <div className="relative w-full max-w-5xl">
            <img 
              src="/ancestory-images/home-hero.avif" 
              alt="Ancestry Heritage"
              className="w-full h-auto block mx-auto"
            />
            <div className="absolute inset-x-0 bottom-[15%] text-center px-6">
              <p className="text-white text-3xl md:text-5xl drop-shadow-md leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Meaning of the name <span className="text-[#9dd040]">{safeString(name)}</span>
              </p>
              
              {topThree.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  {topThree.map((c, idx) => (
                    <div key={c.code} className="bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-3 hover:bg-black/70 transition-colors cursor-default">
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-white font-bold text-base">{c.pct}%</span>
                        <span className="text-white/70 text-[10px] uppercase font-semibold tracking-wider">{c.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AncestorConfidenceBadge({ data }) {
  if (!data) return null;

  const hasGoodData = data.nationality?.country?.length > 0 || data.countries?.length > 0 || data.origin;
  const confidence = hasGoodData ? "high" : "medium";

  const labels = {
    high: "Based on data records",
    medium: "Based on available data",
    low: "Limited data available"
  };

  const styles = {
    high: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${styles[confidence]}`}>
      {labels[confidence]}
    </span>
  );
}

function AncestorStatBars({ origin, meaning, variations }) {
  // Ensure all are strings/arrays
  const originStr = safeString(origin);
  const meaningStr = safeString(meaning);
  const variationsArr = safeArray(variations);

  const flag = inferCountryFromOrigin(originStr) ? countryToFlag(inferCountryFromOrigin(originStr)) : "";

  return (
    <section className="bg-[#f7f7f5] dark:bg-(--background) pb-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl overflow-hidden border border-[#d5d9d1] shadow-sm dark:border-(--border) dark:shadow-emerald-900/10 dark:shadow-md">
            <div className="bg-[#1f6a07] dark:bg-gradient-to-r dark:from-emerald-700 dark:to-emerald-600 text-white text-center text-sm font-semibold py-2">Origin</div>
            <div className="bg-[#e6eee2] text-center py-4 text-[#2d2d2c] font-medium dark:bg-(--muted) dark:text-(--foreground) flex items-center justify-center gap-2">
              {flag && <span>{flag}</span>}
              {originStr || "Unknown"}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#d5d9d1] shadow-sm dark:border-(--border) dark:shadow-emerald-900/10 dark:shadow-md">
            <div className="bg-[#1f6a07] dark:bg-gradient-to-r dark:from-emerald-700 dark:to-emerald-600 text-white text-center text-sm font-semibold py-2">Meaning</div>
            <div className="bg-[#e6eee2] text-center py-4 text-[#2d2d2c] font-medium dark:bg-(--muted) dark:text-(--foreground)">{meaningStr || "Not available"}</div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-[#d5d9d1] shadow-sm dark:border-(--border) dark:shadow-emerald-900/10 dark:shadow-md">
          <div className="bg-[#1f6a07] dark:bg-gradient-to-r dark:from-emerald-700 dark:to-emerald-600 text-white text-center text-sm font-semibold py-2">Variations</div>
          <div className="bg-[#e6eee2] text-center py-4 text-[#2f6f97] font-medium dark:bg-(--muted) dark:text-sky-300">
            {variationsArr.length > 0 ? variationsArr.slice(0, 4).join(", ") : "No variations available"}
          </div>
        </div>
      </div>
    </section>
  );
}

function AncestorRecordCards({ name, data }) {
  const surname = safeString(getCommonSurname(name, data));
  const partner = safeString(getPartnerName(name, data));
  const displayName = safeString(name);
  const hasSurname = Boolean(surname);
  const hasPartner = Boolean(partner);

  return (
    <section className="bg-[#f7f7f5] py-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h3 className="text-5xl mb-8 text-[#2f2f2e]" style={{ fontFamily: "Georgia, serif" }}>
          Based on data records...
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0dc] overflow-hidden dark:bg-(--muted) dark:border-(--border)">
            <div className="bg-[#c9d8c5] py-8 flex justify-center dark:bg-(--muted-gray)">
              <UserCircle2 size={68} className="text-[#2d5246] dark:text-green-300" />
            </div>
            <div className="p-5">
              <p className="text-4xl mb-2 text-[#2f2f2e] dark:text-(--foreground)" style={{ fontFamily: "Georgia, serif" }}>{surname || "Unknown"}</p>
              <p className="text-sm text-[#555] dark:text-(--muted-foreground)">
                {hasSurname
                  ? `Common surname associated with ${displayName} based on geographical data.`
                  : `No reliable surname association available for ${displayName}.`}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0dc] overflow-hidden dark:bg-(--muted) dark:border-(--border)">
            <div className="bg-[#c6d9e8] py-8 flex justify-center dark:bg-(--muted-gray)">
              <Gem size={64} className="text-[#2f6f97] dark:text-sky-300" />
            </div>
            <div className="p-5">
              <p className="text-4xl mb-2 text-[#2f2f2e] dark:text-(--foreground)" style={{ fontFamily: "Georgia, serif" }}>{partner || "Unknown"}</p>
              <p className="text-sm text-[#555] dark:text-(--muted-foreground)">
                {hasPartner
                  ? `Common partner name for ${displayName} based on historical records.`
                  : `No reliable partner-name association available for ${displayName}.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AncestorCountriesBlock({ countries, name }) {
  const displayName = safeString(name);

  // Normalize countries array
  let normalizedCountries = [];
  if (Array.isArray(countries)) {
    normalizedCountries = countries;
  } else if (countries?.country) {
    normalizedCountries = countries.country;
  }

  const topTwo = normalizedCountries.slice(0, 2);

  return (
    <section className="bg-[#f7f7f5] pb-12">
      <AncestorOriginMap countries={normalizedCountries} name={displayName} />
      <div className="max-w-5xl mx-auto px-6 text-center py-5">
        <p className="text-[#2f2f2e] font-semibold dark:text-(--foreground)">Top countries by historical records</p>
        {topTwo.length > 0 ? (
          <>
            <p className="text-[#6a6a68] text-sm mb-2 dark:text-(--muted-foreground)">
              Countries with the highest concentration of {displayName} based on available data
            </p>
            <div className="flex justify-center gap-8 text-sm text-[#3f3f3d] dark:text-(--secondary-foreground)">
              {topTwo.map((c) => {
                const countryId = c.country_id || c.code || "";
                const countryName = COUNTRY_NAMES[countryId] || countryId;
                const prob = c.probability ? Math.round(c.probability * 100) : (c.probability || 0);
                return (
                  <span key={countryId} className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#64a43d]" />
                    {countryName}
                    {prob > 0 && ` (${prob}%)`}
                  </span>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-[#6a6a68] text-sm dark:text-(--muted-foreground)">
            Country distribution data is being analyzed for {displayName}.
          </p>
        )}
      </div>
    </section>
  );
}

function AncestorDidYouKnow({ name, data }) {
  const year = getPeakYear(data);
  const fact = safeString(getFunFact(name, data));
  const displayName = safeString(name);

  return (
    <section className="bg-[#f1f2ef] py-16 border-t border-[#e0e0dc] dark:bg-(--background) dark:border-(--border)">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6">
        <CalendarDays size={88} className="text-[#3f5f54]" />
        <div>
          <p className="text-xl text-[#3f3f3e] dark:text-(--foreground)" style={{ fontFamily: "Georgia, serif" }}>
            Historical Context
          </p>
          <p className="text-sm text-[#5f5f5e] dark:text-(--secondary-foreground) mt-1">Did you know?</p>
          <p className="text-3xl text-[#2f2f2f] dark:text-(--foreground) mt-2">
            <span className="font-semibold">{year}</span> was a notable year for the name {displayName}.
          </p>
          <p className="text-sm text-[#666] dark:text-(--secondary-foreground) mt-2">{fact}</p>
        </div>
      </div>
    </section>
  );
}

export function AncestorMeaningPage({ type, firstNameParam, lastNameParam, initialData = null, error = null, isMissingInput = false }) {
  const firstName = titleCase(decodeURIComponent(firstNameParam || ""));
  const lastName = titleCase(decodeURIComponent(lastNameParam || ""));

  const lookupType = type === "full" ? "full" : type;
  const data = initialData;

  const primaryName = lookupType === "last" ? lastName : firstName;
  const primaryData = lookupType === "last" ? data?.lastName : data?.firstName;

  if (isMissingInput) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-gray-700 dark:text-(--foreground) mb-6">
          Enter a name above or return to the search page to start a new lookup.
        </p>
        <AncestorSearchPanel large placeholder="Enter a name" />
      </div>
    );
  }

  if (error || !primaryData) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-gray-700 dark:text-(--foreground) mb-4">
          {error || `Could not load data for "${primaryName}". Please try again.`}
        </p>
        <Link href="/ancestory" className="text-[#005831] underline">
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          Return to search
        </Link>
      </div>
    );
  }

  // Generate content - all safe strings
  // Enhanced origin calculation
  const nationalizeOrigin = getNationalizeOrigin(primaryData);
  const inferredId = inferCountryFromOrigin(primaryData?.nameInfo?.origin || primaryName);
  const inferredName = inferredId ? COUNTRY_NAMES[inferredId] : null;

  const origin = safeString(
    nationalizeOrigin
      ? `${nationalizeOrigin.countryName}${nationalizeOrigin.probability > 0 ? ` (${nationalizeOrigin.probability}%)` : ""}`
      : (getOriginLabel(primaryName, primaryData) !== "Unknown" 
          ? getOriginLabel(primaryName, primaryData) 
          : (inferredName || "Unknown"))
  );
  const meaning = safeString(getMeaning(primaryName, primaryData));
  const description = safeString(getDescription(primaryName, primaryData));
  const variations = safeArray(getVariations(primaryName, primaryData));

  const sources = [...new Set([...(primaryData?.nameInfo?.sources || []), ...(primaryData?.quality?.sources || [])])];

  // Get countries from API; fallback from origin so map can still render.
  const countriesFromApi = primaryData?.nationality?.country || primaryData?.countries || [];
  const fallbackCountry = inferCountryFromOrigin(origin || primaryData?.nameInfo?.origin || primaryName);
  const countries = countriesFromApi.length > 0
    ? countriesFromApi
    : (fallbackCountry ? [{ country_id: fallbackCountry, probability: 1 }] : [{ country_id: "IN", probability: 0.1 }]); // Final fallback to prevent empty map

  return (
    <div className="min-h-screen bg-white dark:bg-(--background)">
      <AncestorHeroMeaning name={primaryName} data={primaryData} />
      <AncestorStatBars origin={origin} meaning={meaning} variations={variations} />
      <AncestorNationalizeOriginBlock data={primaryData} />
      <AncestorPremiumInsight
        name={primaryName}
        origin={origin}
        meaning={meaning}
        variations={variations}
      />

      <section className="bg-[#f7f7f5] pb-12 dark:bg-(--background)">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#686866] dark:text-(--muted-foreground)">
              Data based on publicly available name records and statistical analysis.
            </p>
            <AncestorConfidenceBadge data={primaryData} />
          </div>
          <div className="rounded-xl border border-[#dadad6] bg-white p-6 text-[#3f3f3e] shadow-sm md:p-8 dark:bg-(--muted) dark:border-(--border) dark:text-(--foreground)" style={{ whiteSpace: 'pre-line' }}>
            {description}
          </div>
          <AncestorDataSourceChips sources={sources} />
        </div>
      </section>

      <AncestorRecordCards name={primaryName} data={primaryData} />
      <AncestorCountriesBlock countries={countries} name={primaryName} />

      <AncestorDidYouKnow name={primaryName} data={primaryData} />

      <section className="bg-[#195f08] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-white text-xl mb-6" style={{ fontFamily: "Georgia, serif" }}>
            Explore the origins of another name.
          </p>
          <AncestorSearchPanel large placeholder="Enter a name" />
        </div>
      </section>

      {lookupType === "full" && data?.lastName && (
        <section className="bg-white py-12 border-t border-[#ecece8]">
          <div className="max-w-5xl mx-auto px-6">
            <h3 className="text-3xl mb-4" style={{ fontFamily: "Georgia, serif" }}>
              Last Name Analysis: {lastName}
            </h3>
            <div className="bg-[#f7f7f5] border border-[#e3e3df] rounded-lg p-6 text-[#3f3f3e]" style={{ whiteSpace: 'pre-line' }}>
              {safeString(getDescription(lastName, data.lastName))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
