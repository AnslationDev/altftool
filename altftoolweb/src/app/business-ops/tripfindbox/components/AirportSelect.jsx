"use client";

import { ChevronLeft, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FloatingCallIcon from "./FloatingCallIcon";
import { announceBookingPopupOpen, useBookingPopupCoordinator } from "@/app/business-ops/tripfindbox/lib/bookingPopupBus";
import { getFloatingLayerStyle, prepareBookingPopup } from "@/app/business-ops/tripfindbox/lib/bookingInteraction";
import { airports as fallbackAirports } from "@/app/business-ops/tripfindbox/lib/travelApi";
import { useTripFindBoxContactInfo } from "@/app/business-ops/tripfindbox/hooks/useTripFindBoxContactInfo";

function shouldUseFloatingPopup() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
}

export default function AirportSelect({ label, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(fallbackAirports);
  const [loading, setLoading] = useState(false);
  const [placement, setPlacement] = useState("below");
  const [floatingStyle, setFloatingStyle] = useState({});
  const [mobilePicker, setMobilePicker] = useState(false);
  const fieldRef = useRef(null);
  const triggerRef = useRef(null);
  const desktopInputRef = useRef(null);
  const popupId = useId();
  const closePanel = useCallback(() => setOpen(false), []);
  const contact = useTripFindBoxContactInfo();

  useBookingPopupCoordinator(popupId, open, closePanel);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const sync = () => setMobilePicker(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const updatePosition = useCallback((nextPlacement = placement) => {
    if (!triggerRef.current) return;
    if (!shouldUseFloatingPopup()) {
      setPlacement("below");
      setFloatingStyle({});
      return;
    }
    setFloatingStyle(getFloatingLayerStyle(triggerRef.current, nextPlacement, { height: 420 }));
  }, [placement]);

  const openPanel = async () => {
    if (!fieldRef.current || !triggerRef.current) return;
    announceBookingPopupOpen(popupId);
    if (!shouldUseFloatingPopup()) {
      setPlacement("below");
      setFloatingStyle({});
      setOpen(true);
      return;
    }
    const nextPlacement = await prepareBookingPopup(triggerRef.current, 420);
    setPlacement(nextPlacement);
    setFloatingStyle(getFloatingLayerStyle(triggerRef.current, nextPlacement, { height: 420 }));
    setOpen(true);
  };

  useEffect(() => {
    if (open && !mobilePicker) {
      window.requestAnimationFrame(() => desktopInputRef.current?.focus({ preventScroll: true }));
    }
  }, [mobilePicker, open]);

  useEffect(() => {
    if (!open) return;
    const handleUpdate = () => updatePosition();
    const handlePointerDown = (event) => {
      if (!shouldUseFloatingPopup()) return;
      const target = event.target;
      if (!target) return;
      if (fieldRef.current?.contains(target)) return;
      if (target.closest?.(".booking-popup")) return;
      setOpen(false);
    };
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
      document.removeEventListener("pointerdown", handlePointerDown);
    };

  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const term = query.trim();
    if (!term) {
      return () => controller.abort();
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/business-ops/tripfindbox/api/travel/airports?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;

        const payload = await response.json();
        setResults(payload.results?.length ? payload.results : []);
      } catch {
        if (!controller.signal.aborted) {
          const normalizedTerm = term.toLowerCase();
          setResults(
            normalizedTerm
              ? fallbackAirports.filter((airport) =>
                  `${airport.city} ${airport.code} ${airport.airport}`.toLowerCase().includes(normalizedTerm),
                )
              : mobilePicker
                ? []
                : fallbackAirports,
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, term ? 250 : 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [mobilePicker, open, query]);

  const visibleResults = !query.trim() ? [] : results;
  const fieldClassName = `search-field flex w-full items-center gap-3 rounded-full border bg-[#F1F1F1] text-left transition focus:outline-none ${
    error ? "border-red-400" : "border-transparent focus:border-[#2E3192] hover:border-[#2E3192]/35"
  }`;

  return (
    <div ref={fieldRef} className="relative min-w-0 flex-1">
      {open && !mobilePicker ? (
        <div
          ref={(node) => {
            triggerRef.current = node;
          }}
          tabIndex={-1}
          className={fieldClassName}
        >
          <span className="search-icon grid shrink-0 place-items-center text-[#2E3192]">
            <MapPin size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="search-label block font-bold text-[#111111]">{label}</span>
            <input
              ref={desktopInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setQuery("");
                  setOpen(false);
                }
              }}
              aria-label={`${label} airport search`}
              placeholder="Search city or airport"
              className={`block w-full min-w-0 bg-transparent text-base font-bold text-[#111111] outline-none ${
                query.trim() ? "" : "search-value-empty"
              }`}
            />
            <span className="block truncate text-xs text-[#111111]/55">{value?.airport ?? ""}</span>
          </span>
        </div>
      ) : (
        <button
          ref={(node) => {
            triggerRef.current = node;
          }}
          type="button"
          onClick={() => {
            if (open) {
              setOpen(false);
              return;
            }
            void openPanel();
          }}
          className={fieldClassName}
        >
          <span className="search-icon grid shrink-0 place-items-center text-[#2E3192]">
            <MapPin size={19} />
          </span>
          <span className="min-w-0">
            <span className="search-label block font-bold text-[#111111]">{label}</span>
            <span className={`block truncate text-base font-bold ${value ? "text-[#111111]" : "search-value-empty text-[#8C8C8C]"}`}>
              {value ? `${value.city} (${value.code})` : label === "From" ? "Leaving from" : "Where to"}
            </span>
            <span className="block truncate text-xs text-[#111111]/55">{value?.airport ?? ""}</span>
          </span>
        </button>
      )}
      {error ? <p className="mt-2 px-4 text-xs font-semibold text-red-500">{error}</p> : null}
      {open && (mobilePicker || query.trim()) ? createPortal(
        <div
          className={`booking-popup airport-popup booking-popup-${placement} fixed inset-x-3 bottom-3 z-[9999] max-h-[72vh] rounded-[28px] border border-black/5 bg-white p-3 shadow-2xl md:inset-auto md:max-h-none`}
          style={floatingStyle}
        >
          <div className="mobile-picker-head">
            <button type="button" aria-label="Go back" onClick={() => setOpen(false)}>
              <ChevronLeft size={26} />
            </button>
            <strong>{label === "From" ? "Select Departure" : "Select Destination"}</strong>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={26} />
            </button>
          </div>
          {mobilePicker ? (
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={label === "From" ? "Depart from" : "Arrive to"}
              className="airport-search-input mb-2 h-12 w-full rounded-full bg-[#F1F1F1] px-4 text-sm text-[#111111] outline-none ring-[#2E3192]/20 placeholder:text-[#9A9A9A] focus:ring-4"
              autoFocus
            />
          ) : null}
          <div className="airport-results-list max-h-[52vh] overflow-y-auto md:max-h-72">
            {loading ? (
              <p className="airport-empty-state px-4 py-5 text-center text-sm font-semibold text-[#111111]/55">
                Searching airports...
              </p>
            ) : null}
            {!loading && visibleResults.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => {
                  onChange(airport);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-[#F1F1F1]"
              >
                <span>
                  <span className="block text-sm font-bold text-[#111111]">{airport.city}</span>
                  <span className="block text-xs text-[#111111]/55">{airport.airport}</span>
                </span>
                <span className="rounded-full bg-[#2E3192]/10 px-3 py-1 text-xs font-bold text-[#2E3192]">{airport.code}</span>
              </button>
            ))}
            {!loading && !visibleResults.length && query.trim() ? (
              <p className="airport-empty-state px-4 py-5 text-center text-sm font-semibold text-[#111111]/55">
                No matching airports found.
              </p>
            ) : null}
          </div>
          <a className="mobile-picker-callbar" href={contact.href}>
            <span><FloatingCallIcon /></span>
            <b>{contact.mobileCallText}</b>
            <strong>{contact.phone}</strong>
          </a>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
