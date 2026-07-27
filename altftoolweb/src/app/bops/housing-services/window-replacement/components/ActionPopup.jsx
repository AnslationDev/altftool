import { useEffect, useState } from "react";
import Icon from "./Icons.jsx";
import { company } from "../data/site.js";

// Searching spinner overlay
function SearchingOverlay() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink/70 backdrop-blur-sm">
      <style>{`
        @keyframes searchSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes searchPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.92); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-8px); }
        }
      `}</style>

      <div
        className="flex flex-col items-center gap-7 rounded-3xl bg-cream px-14 py-10 shadow-2xl shadow-ink/30"
        style={{ animation: "fadeSlideIn 0.35s ease-out both" }}
      >
        {/* Ring spinner */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border-4 border-bronze-200"
          />
          <span
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-bronze-600"
            style={{ animation: "searchSpin 0.9s linear infinite" }}
          />
          <Icon name="search" className="h-7 w-7 text-bronze-600" />
        </div>

        <p className="font-display text-xl font-semibold text-ink">Searching…</p>

        {/* Bouncing dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-bronze-500"
              style={{ animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// "No Result Found" result card
function ResultPopup({ onClose, onModify }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(189,132,60,0.55), 0 0 0 0 rgba(189,132,60,0.3); }
          50%       { box-shadow: 0 0 0 16px rgba(189,132,60,0), 0 0 0 30px rgba(189,132,60,0); }
        }
        @keyframes floatAgent {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
      `}</style>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-cream text-center shadow-2xl shadow-ink/20"
        style={{ animation: "popIn 0.4s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 hover:text-ink"
          aria-label="Close"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        {/* Header band */}
        <div className="bg-gradient-to-br from-bronze-600 to-bronze-800 px-8 pt-10 pb-6">
          <h2 className="font-display text-2xl font-bold text-white">
            Sorry! No Result Found.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-bronze-100">
            Let our experts help you find the best window solution for your space.
          </p>
        </div>

        {/* Agent illustration */}
        <div className="flex justify-center py-6">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-bronze-100 to-stone-100 shadow-lg shadow-bronze-200/60"
            style={{ animation: "floatAgent 3s ease-in-out infinite" }}
          >
            {/* Headset icon cluster */}
            <div className="relative flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bronze-600 text-white shadow-md shadow-bronze-700/40">
                <Icon name="mail" className="h-8 w-8" />
              </div>
              <span
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
                style={{ animation: "ringPulse 2s ease-in-out infinite" }}
              >
                <span className="h-3 w-3 rounded-full bg-bronze-500" />
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Call section */}
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Send us your project
          </p>
          <a
            href={company.contactUrl}
            className="mt-3 flex items-center justify-center gap-3 rounded-2xl bg-ink px-6 py-4 font-display text-xl font-semibold text-white shadow-lg shadow-ink/20 transition-all hover:-translate-y-0.5 hover:bg-stone-800"
          >
            <Icon name="mail" className="h-5 w-5 text-bronze-400" />
            {company.contactLabel}
          </a>

          {/* Modify search button */}
          <button
            onClick={onModify}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-bronze-500 hover:text-bronze-700"
          >
            <Icon name="search" className="h-4 w-4" />
            Modify Search
          </button>
        </div>
      </div>
    </div>
  );
}

// Main exported hook / wrapper
export function useActionPopup() {
  const [phase, setPhase] = useState(null); // null | "searching" | "result"

  const trigger = () => {
    setPhase("searching");
    setTimeout(() => setPhase("result"), 1500);
  };

  const close = () => setPhase(null);

  const Popup = () =>
    phase === "searching" ? (
      <SearchingOverlay />
    ) : phase === "result" ? (
      <ResultPopup onClose={close} onModify={close} />
    ) : null;

  return { trigger, Popup };
}
