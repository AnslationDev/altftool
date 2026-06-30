"use client";

import Image from "next/image";
import { PhoneCall, Plane, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FlightSearchBox from "@/app/tripfindbox/components/FlightSearchBox";
import ResultsHeader from "@/app/tripfindbox/components/ResultsHeader";
import { useTripFindBoxContactInfo } from "@/app/tripfindbox/hooks/useTripFindBoxContactInfo";
import { loadSearchCriteria, saveSearchCriteria, saveSearchResults } from "@/app/tripfindbox/lib/searchSession";
import { searchTravelResults } from "@/app/tripfindbox/lib/travelResults";

function formatMobileDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function travelerSummary(criteria) {
  const total = criteria.travelers.adults + criteria.travelers.children + criteria.travelers.infants;
  return `${total}Traveler, ${criteria.travelers.cabin}`;
}

export default function NoResultsPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const contact = useTripFindBoxContactInfo();

  useEffect(() => {
    queueMicrotask(() => {
      setCriteria(loadSearchCriteria());
    });
  }, []);

  const routeTitle = criteria ? `${criteria.from.city} to ${criteria.to.city}` : "Your travel search";

  const runInlineSearch = async (nextCriteria) => {
    saveSearchCriteria(nextCriteria);
    setIsMobileSearching(true);
    const nextResults = await searchTravelResults(nextCriteria);
    saveSearchResults(nextResults);
    setCriteria(nextCriteria);
    setIsMobileSearchOpen(false);
    setIsMobileSearching(false);
    if (nextResults.length) {
      router.replace("/tripfindbox/search/results");
    }
  };

  return (
    <main className="results-found-page empty-page">
      <ResultsHeader />

      {criteria ? (
        <>
          <section className="mobile-results-topbar" aria-label="Current search">
            <button type="button" className="mobile-results-route" onClick={() => setIsMobileSearchOpen(true)}>
              <strong>{criteria.from.code} → {criteria.to.code}</strong>
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
        </>
      ) : null}

      <section className="results-search-band no-results-search-band">
        <FlightSearchBox compact initialCriteria={criteria} />
      </section>
      <section className="no-result-reference-card">
        <div className="no-result-decor decor-one" />
        <div className="no-result-decor decor-two" />
        <div className="no-result-title">
          <h1>Sorry! No Result Found.</h1>
          <p>Let our agents help you find the best flight option for {routeTitle}.</p>
        </div>
        <div className="no-result-agent-wrap">
          <Image
            src="/tripfindbox/support-agent.svg"
            alt="TripFindBox travel support agent"
            width={430}
            height={320}
            priority
            className="no-result-agent"
          />
        </div>
        <h2>Now Call Toll Free</h2>
        <a className="no-result-call" href={contact.href}>
          <PhoneCall size={34} />
          {contact.phone}
        </a>
        <h3>We are available 24x7</h3>
        <button
          className="no-result-modify"
          type="button"
          onClick={() => {
            if (window.innerWidth <= 860) {
              setIsMobileSearchOpen(true);
              return;
            }
            window.scrollTo({ top: 70, behavior: "smooth" });
          }}
        >
          <Search size={18} />
          Modify Search
        </button>
        <span className="no-result-plane"><Plane size={34} /></span>
      </section>
      <section className="no-result-trust-band" aria-label="TripFindBox trust badges">
        <span>TripFindBox Verified</span>
        <span>Secure Fare Search</span>
        <span>Cloud Protected</span>
      </section>
      <footer className="no-result-disclaimer">
        <p><strong>DISCLAIMER:</strong> TripFindBox is an independent travel search experience. Information shown on this website is for general travel planning purposes. If you need help with your flight search, contact support@tripfindbox.com.</p>
        <small>© 2026 TripFindBox. All Rights Reserved.</small>
      </footer>

    </main>
  );
}
