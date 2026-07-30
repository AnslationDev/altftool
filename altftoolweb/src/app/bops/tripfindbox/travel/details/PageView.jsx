"use client";

import { ArrowLeft, Briefcase, Clock, Plane, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadSearchCriteria, loadSelectedTravel } from "@/app/bops/tripfindbox/lib/searchSession";

function formatMoney(value) {
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}

export default function TravelDetailsPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState(null);
  const [result, setResult] = useState(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setCriteria(loadSearchCriteria());
      setResult(loadSelectedTravel());
      setHasLoadedSession(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedSession) return;
    if (!criteria || !result) {
      router.replace("/bops/tripfindbox");
    }
  }, [criteria, hasLoadedSession, result, router]);

  if (!hasLoadedSession || !criteria || !result) return null;

  return (
    <main className="flow-page details-page">
      <header className="flow-header">
        <Link href="/bops/tripfindbox/search/results" className="flow-back"><ArrowLeft size={18} /> Back to results</Link>
        <div>
          <strong>{result.provider}</strong>
          <span>{criteria.from.city} to {criteria.to.city}</span>
        </div>
      </header>
      <section className="details-layout">
        <article className="details-hero-card">
          <span><Plane size={24} /></span>
          <h1>{criteria.from.code} → {criteria.to.code}</h1>
          <p>{result.departTime} departure · {result.arriveTime} arrival · {result.duration}</p>
          <div className="detail-timeline">
            <b>{criteria.from.city}</b>
            <i />
            <small><Clock size={15} /> {result.duration}</small>
            <i />
            <b>{criteria.to.city}</b>
          </div>
        </article>
        <aside className="fare-summary-card">
          <span>Fare from</span>
          <strong>{formatMoney(result.price)}</strong>
          <p>{criteria.tripType === "round" ? "Round trip" : "One way"} · {criteria.travelers.cabin}</p>
          {result.isEstimatedPrice && <small>Estimated price, schedule only — confirm the fare with the airline.</small>}
          <Link href="/bops/tripfindbox/booking" className="primary-flow-button">Continue booking</Link>
        </aside>
        <article className="details-info-card"><Briefcase size={22} /><h2>Baggage</h2><p>{result.baggage}</p></article>
        <article className="details-info-card"><ShieldCheck size={22} /><h2>Fare notes</h2><p>Review passenger details and fare rules before booking confirmation.</p></article>
      </section>
    </main>
  );
}
