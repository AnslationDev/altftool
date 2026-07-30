"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Filter,
  Luggage,
  Plane,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FlightSearchBox from "@/app/bops/tripfindbox/components/FlightSearchBox";
import FloatingCallIcon from "@/app/bops/tripfindbox/components/FloatingCallIcon";
import ResultsHeader from "@/app/bops/tripfindbox/components/ResultsHeader";
import { useTripFindBoxContactInfo } from "@/app/bops/tripfindbox/hooks/useTripFindBoxContactInfo";
import { loadSearchCriteria, loadSearchResults, saveSearchCriteria, saveSearchResults, saveSelectedTravel } from "@/app/bops/tripfindbox/lib/searchSession";
import { searchTravelResults } from "@/app/bops/tripfindbox/lib/travelResults";

function formatMoney(value) {
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "2-digit" }).format(date);
}

function formatMobileDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function travelerSummary(criteria) {
  const total = criteria.travelers.adults + criteria.travelers.children + criteria.travelers.infants;
  return `${total}Traveler, ${criteria.travelers.cabin}`;
}

export default function ResultsPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState(null);
  const [results, setResults] = useState([]);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const contact = useTripFindBoxContactInfo();

  useEffect(() => {
    queueMicrotask(() => {
      const savedCriteria = loadSearchCriteria();
      const savedResults = loadSearchResults();
      setCriteria(savedCriteria);
      setResults(savedResults);
      setHasLoadedSession(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedSession) return;
    if (!criteria) {
      router.replace("/bops/tripfindbox");
      return;
    }
    if (!results.length) {
      router.replace("/bops/tripfindbox/search/no-results");
    }
  }, [criteria, hasLoadedSession, results.length, router]);

  const sorted = useMemo(() => [...results].sort((a, b) => a.price - b.price), [results]);
  const minPrice = sorted[0]?.price ?? 0;
  const maxPrice = sorted.at(-1)?.price ?? minPrice;
  const tripLabel = criteria?.tripType === "round" ? "Round Trip" : "One Way";
  const filterProviders = sorted.slice(0, 4);
  const [showFareWatch, setShowFareWatch] = useState(false);

  const runInlineSearch = async (nextCriteria) => {
    saveSearchCriteria(nextCriteria);
    setIsMobileSearching(true);
    const nextResults = await searchTravelResults(nextCriteria);
    saveSearchResults(nextResults);
    setCriteria(nextCriteria);
    setResults(nextResults);
    setIsMobileSearchOpen(false);
    setIsMobileSearching(false);
    if (!nextResults.length) {
      router.replace("/bops/tripfindbox/search/no-results");
    }
  };

  useEffect(() => {
    if (!criteria || !results.length) return undefined;
    const timer = window.setTimeout(() => setShowFareWatch(true), 550);
    return () => window.clearTimeout(timer);
  }, [criteria, results.length]);

  if (!hasLoadedSession || !criteria) return null;

  return (
    <main className="results-found-page">
      <ResultsHeader />

      <section className="mobile-results-topbar" aria-label="Current search">
        <button type="button" className="mobile-results-route" onClick={() => setIsMobileSearchOpen(true)}>
          <strong>{criteria.from.code} ↔ {criteria.to.code}</strong>
          <span>
            {formatMobileDate(criteria.departureDate)}
            {criteria.tripType === "round" && criteria.returnDate ? ` - ${formatMobileDate(criteria.returnDate)}` : ""} | {travelerSummary(criteria)}
          </span>
        </button>
        <button type="button" className="mobile-results-search-icon" aria-label="Modify search" onClick={() => setIsMobileSearchOpen(true)}>
          <Search size={24} />
        </button>
      </section>

      <div className={`mobile-results-search-drawer ${isMobileSearchOpen ? "is-open" : ""}`} aria-hidden={!isMobileSearchOpen}>
        <button type="button" className="mobile-results-drawer-backdrop" aria-label="Close search panel" onClick={() => setIsMobileSearchOpen(false)} />
        <aside className="mobile-results-drawer-panel" role="dialog" aria-modal="true" aria-label="Modify flight search">
          <button type="button" className="mobile-results-drawer-close" aria-label="Close search panel" onClick={() => setIsMobileSearchOpen(false)}>
            <X size={30} />
          </button>
          <FlightSearchBox
            key={`${criteria.tripType}-${criteria.from.code}-${criteria.to.code}-${criteria.departureDate.toISOString()}-${criteria.returnDate?.toISOString() ?? "oneway"}`}
            compact
            initialCriteria={criteria}
            onSearchSubmit={runInlineSearch}
          />
          {isMobileSearching ? <div className="mobile-results-drawer-loading">Searching live options...</div> : null}
        </aside>
      </div>

      <div className="mobile-results-tabs" aria-label="Mobile result filters">
        <button type="button" className="active">Recommended</button>
        <button type="button">Stops</button>
        <button type="button">Price</button>
        <button type="button">Times</button>
      </div>
      <p className="mobile-results-count">Showing {sorted.length} Flights</p>

      <section className="results-search-band">
        <FlightSearchBox compact initialCriteria={criteria} />
      </section>

      <section className="results-shell">
        <aside className="results-filter-panel">
          <Link href="/bops/tripfindbox" className="results-modify-link"><ArrowLeft size={16} /> Modify Search</Link>
          <h2><Filter size={18} /> Filters</h2>
          <p>Showing {sorted.length} flights</p>

          <div className="filter-group">
            <h3>Stops</h3>
            <label><input type="checkbox" /> {sorted[0]?.stops ?? "Available"} <span>{formatMoney(minPrice)}</span></label>
          </div>

          <div className="filter-group">
            <h3>Price</h3>
            <div className="price-scale">
              <span>{formatMoney(minPrice)}</span>
              <span>{formatMoney(maxPrice)}</span>
            </div>
            <div className="fake-range"><i /></div>
          </div>

          <div className="filter-group filter-grid">
            <h3>Depart From {criteria.from.city}</h3>
            <button>Before 6AM</button>
            <button>6AM - 12PM</button>
            <button>12PM - 6PM</button>
            <button>After 6PM</button>
          </div>

          <div className="filter-group">
            <h3>Airlines</h3>
            {filterProviders.map((result) => (
              <label key={result.id}>
                <input type="checkbox" /> {result.provider}
                <span>{formatMoney(result.price)}</span>
              </label>
            ))}
          </div>
        </aside>

        <section className="results-content">
          <div className="results-sort-tabs">
            <button className="active"><SlidersHorizontal size={15} /> Cheapest <span>{formatMoney(minPrice)} · {sorted[0]?.duration}</span></button>
            <button>Recommended <span>{formatMoney(minPrice)} · {sorted[0]?.duration}</span></button>
            <button>Nearby Airport <span>{formatMoney(minPrice)} · {sorted[0]?.duration}</span></button>
            <button>Shortest Flight <span>{formatMoney(sorted.at(-1)?.price ?? minPrice)} · {sorted.at(-1)?.duration}</span></button>
          </div>

          <div className="results-alert">Oops! Desired Airline Or Fare Not Found. Here Are The Best Options For You.</div>

          <div className="results-card-stack">
            {sorted.map((result, index) => (
              <div className="results-card-wrap" key={result.id}>
                <article className="found-flight-card">
                  <div className="found-card-left">
                    <span className="flight-tag">{result.tag} {!result.isEstimatedPrice && <BadgeCheck size={13} />}</span>
                    <strong className="departure-line">Departure: {formatShortDate(criteria.departureDate)}</strong>
                    <div className="provider-row">
                      <span className="airline-mark"><Plane size={18} /></span>
                      <div>
                        <strong>{result.provider}</strong>
                        <small>{criteria.travelers.cabin}</small>
                      </div>
                    </div>
                  </div>

                  <div className="found-timeline">
                    <div className="time-block">
                      <strong>{result.departTime}</strong>
                      <span>{criteria.from.code}</span>
                    </div>
                    <div className="route-line">
                      <span>{criteria.from.code}</span>
                      <i />
                      <span>{criteria.to.code}</span>
                      <small>{result.stops}</small>
                    </div>
                    <div className="time-block">
                      <strong>{result.arriveTime}</strong>
                      <span>{criteria.to.code}</span>
                    </div>
                    <div className="duration-block">
                      <strong>{result.duration}</strong>
                      <span>Total Trip</span>
                    </div>
                  </div>

                  {criteria.tripType === "round" && criteria.returnDate ? (
                    <div className="mobile-return-itinerary">
                      <strong className="departure-line">Return: {formatShortDate(criteria.returnDate)} | {criteria.travelers.cabin}</strong>
                      <div className="found-timeline">
                        <div className="time-block">
                          <strong>{result.arriveTime}</strong>
                          <span>{criteria.to.code}</span>
                        </div>
                        <div className="route-line">
                          <span>{criteria.to.code}</span>
                          <i />
                          <span>{criteria.from.code}</span>
                          <small>{result.stops}</small>
                        </div>
                        <div className="time-block">
                          <strong>{result.departTime}</strong>
                          <span>{criteria.from.code}</span>
                        </div>
                        <div className="duration-block">
                          <strong>{result.duration}</strong>
                          <span>Total Trip</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="found-price-panel">
                    <strong>{formatMoney(result.price)}</strong>
                    <span>{tripLabel}</span>
                    <button
                      type="button"
                      onClick={() => {
                        saveSelectedTravel(result);
                        router.push("/bops/tripfindbox/travel/details");
                      }}
                    >
                      Select
                    </button>
                    <div className="fare-icons" aria-label="Included benefits">
                      <span><Briefcase size={13} /></span>
                      <span><Luggage size={13} /></span>
                      <span><ShieldCheck size={13} /></span>
                    </div>
                    {result.isEstimatedPrice && (
                      <small className="baggage-note">Estimated price, schedule only — confirm the fare with the airline.</small>
                    )}
                    <small className="baggage-note">{result.baggage}</small>
                  </div>
                </article>

                {index === 1 && (
                  <div className="results-bundle-banner">
                    <span><Sparkles size={18} /> Save Big On Bundles</span>
                    <strong>Add Hotel Or Car With Flight And Save Extra 30% On Your Trip</strong>
                    <a href={contact.href}>{contact.phone}</a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showFareWatch && (
            <aside className="fare-watch-card">
              <button type="button" aria-label="Close fare watch" onClick={() => setShowFareWatch(false)}>×</button>
              <span><UserRound size={24} /></span>
              <strong>Book Before Fare Goes Up!</strong>
              <p>Live travelers are checking flights to {criteria.to.city} right now.</p>
            </aside>
          )}
        </section>
      </section>

      <aside className="mobile-results-callbar" aria-label="Call TripFindBox support">
        <a href={contact.href}>
          <span><FloatingCallIcon /></span>
          <strong>{contact.mobileCallText}</strong>
          <b>{contact.phone}</b>
        </a>
      </aside>
    </main>
  );
}
