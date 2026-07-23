"use client";

import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadSelectedTravel } from "@/app/bops/tripfindbox/lib/searchSession";

export default function BookingPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setResult(loadSelectedTravel());
      setHasLoadedSession(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedSession) return;
    if (!result) {
      router.replace("/bops/tripfindbox");
    }
  }, [hasLoadedSession, result, router]);

  if (!hasLoadedSession || !result) return null;

  return (
    <main className="flow-page booking-page">
      <header className="flow-header">
        <Link href="/bops/tripfindbox/travel/details" className="flow-back"><ArrowLeft size={18} /> Back to details</Link>
        <div>
          <strong>Booking review</strong>
          <span>{result.provider}</span>
        </div>
      </header>
      <section className="booking-card">
        <span><CreditCard size={28} /></span>
        <h1>Secure booking checkout</h1>
        <p>This booking screen is prepared for passenger and payment details. Real purchase confirmation can be connected after fare-order integration.</p>
        <div><ShieldCheck size={18} /> Fare selected: {result.provider}</div>
        <button type="button" className="primary-flow-button">Continue safely</button>
      </section>
    </main>
  );
}
