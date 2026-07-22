"use client";

import { ChevronDown, ChevronLeft, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FloatingCallIcon from "./FloatingCallIcon";
import { announceBookingPopupOpen, useBookingPopupCoordinator } from "@/app/business-ops/tripfindbox/lib/bookingPopupBus";
import { getFloatingLayerStyle, prepareBookingPopup } from "@/app/business-ops/tripfindbox/lib/bookingInteraction";
import { useTripFindBoxContactInfo } from "@/app/business-ops/tripfindbox/hooks/useTripFindBoxContactInfo";

const cabins = ["Economy", "Premium Economy", "Business", "First"];

function shouldUseFloatingPopup() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
}

function travelerText(value) {
  const total = value.adults + value.children + value.infants;
  return `${total} Traveler${total > 1 ? "s" : ""}`;
}

export default function TravelerCabinDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("below");
  const [floatingStyle, setFloatingStyle] = useState({});
  const fieldRef = useRef(null);
  const buttonRef = useRef(null);
  const popupId = useId();
  const closePanel = useCallback(() => setOpen(false), []);
  const contact = useTripFindBoxContactInfo();
  const isDefaultTravelers =
    value.adults === 1 && value.children === 0 && value.infants === 0 && value.cabin === "Economy";

  useBookingPopupCoordinator(popupId, open, closePanel);
  const updateCount = (key, amount) => {
    onChange({ ...value, [key]: Math.max(key === "adults" ? 1 : 0, value[key] + amount) });
  };
  const updatePosition = useCallback((nextPlacement = placement) => {
    if (!buttonRef.current) return;
    if (!shouldUseFloatingPopup()) {
      setPlacement("below");
      setFloatingStyle({});
      return;
    }
    setFloatingStyle(getFloatingLayerStyle(buttonRef.current, nextPlacement, { width: 360, height: 420 }));
  }, [placement]);

  const openPanel = async () => {
    if (!buttonRef.current) return;
    announceBookingPopupOpen(popupId);
    if (!shouldUseFloatingPopup()) {
      setPlacement("below");
      setFloatingStyle({});
      setOpen(true);
      return;
    }
    const nextPlacement = await prepareBookingPopup(buttonRef.current, 420);
    setPlacement(nextPlacement);
    setFloatingStyle(getFloatingLayerStyle(buttonRef.current, nextPlacement, { width: 360, height: 420 }));
    setOpen(true);
  };

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

  return (
    <div ref={fieldRef} className="relative min-w-0 flex-1">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          void openPanel();
        }}
        className="search-field flex w-full items-center gap-3 rounded-full border border-transparent bg-[#F1F1F1] text-left transition hover:border-[#2E3192]/35 focus:border-[#2E3192] focus:outline-none"
      >
        <span className="search-icon grid shrink-0 place-items-center text-[#2E3192]">
          <UserRound size={19} />
        </span>
        <span className="min-w-0">
          <span className="search-label block font-bold text-[#111111]">Traveler(s) & cabin</span>
          <span className={`block truncate text-base font-bold ${isDefaultTravelers ? "search-value-empty text-[#8C8C8C]" : "text-[#111111]"}`}>
            {travelerText(value)}
          </span>
          <span className={`block truncate text-xs ${isDefaultTravelers ? "search-value-empty text-[#8C8C8C]" : "text-[#111111]/55"}`}>{value.cabin}</span>
        </span>
      </button>
      {open ? createPortal(
        <div
          className={`booking-popup traveler-popup booking-popup-${placement} fixed inset-x-3 bottom-3 z-[9999] max-h-[72vh] overflow-y-auto rounded-[28px] border border-black/5 bg-white p-4 shadow-2xl md:inset-auto md:w-[360px]`}
          style={floatingStyle}
        >
          <div className="mobile-picker-head">
            <button type="button" aria-label="Go back" onClick={() => setOpen(false)}>
              <ChevronLeft size={26} />
            </button>
            <strong>Traveler(s) &amp; Cabin</strong>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={26} />
            </button>
          </div>
          <div className="mobile-traveler-summary">
            <span>
              <UserRound size={19} />
            </span>
            <div>
              <b>Traveler(s) &amp; Cabin</b>
              <em>{value.cabin}</em>
            </div>
            <ChevronDown size={24} />
          </div>
          {[
            ["adults", "Adult"],
            ["children", "Child"],
            ["infants", "Infant On Lap"],
          ].map(([key, label]) => (
            <div key={key} className="traveler-row flex items-center justify-between border-b border-black/5 py-3 last:border-b-0">
              <span className="font-bold text-[#111111]">
                {label}
                {key === "children" ? <small>2-11yrs</small> : null}
                {key === "infants" ? <small>under 2yrs</small> : null}
              </span>
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateCount(key, -1)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#F1F1F1] font-bold text-[#2E3192]"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold">{value[key]}</span>
                <button
                  type="button"
                  onClick={() => updateCount(key, 1)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#2E3192] font-bold text-white"
                >
                  +
                </button>
              </span>
            </div>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {cabins.map((cabin) => (
              <button
                key={cabin}
                type="button"
                onClick={() => onChange({ ...value, cabin })}
                className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                  value.cabin === cabin ? "bg-[#2E3192] text-white" : "bg-[#F1F1F1] text-[#111111]/75 hover:text-[#2E3192]"
                }`}
              >
                {cabin}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 h-12 w-full rounded-full bg-[#2E3192] font-bold text-white shadow-lg shadow-[#2E3192]/25"
          >
            Done
          </button>
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
