"use client";

import { Minus, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveSearchCriteria } from "@/app/business-ops/tripfindbox/lib/searchSession";
import DatePickerPopup from "./DatePickerPopup";

const defaultTravelers = {
  adults: 1,
  children: 0,
  infants: 0,
  cabin: "Economy",
};

function airportFromDeal(city, code) {
  return {
    city,
    code,
    airport: `${city} Airport`,
  };
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function defaultDepartureDate() {
  return stripTime(new Date());
}

function defaultReturnDate() {
  return addDays(defaultDepartureDate(), 1);
}

export default function SeoRouteDealsGrid({ deals }) {
  const router = useRouter();
  const [activeDeal, setActiveDeal] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [popoverStyle, setPopoverStyle] = useState({});
  const [popoverPlacement, setPopoverPlacement] = useState("below");
  const [tripType, setTripType] = useState("round");
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [travelers, setTravelers] = useState(defaultTravelers);
  const [routing, setRouting] = useState(false);
  const shellRef = useRef(null);
  const cardRefs = useRef([]);

  const activeTitle = activeDeal ? `From ${activeDeal.from} to ${activeDeal.to}` : "";
  const canSearch = Boolean(activeDeal && departureDate && (tripType === "oneway" || returnDate));

  const positionPopover = useCallback((card) => {
    if (!shellRef.current) return;
    const shellRect = shellRef.current.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    const priceRect = card.querySelector(".seo-route-deal-price")?.getBoundingClientRect();
    const cardLeft = rect.left - shellRect.left;
    const cardRight = rect.right - shellRect.left;
    const cardWidth = cardRight - cardLeft;
    const popupWidth = Math.min(window.innerWidth <= 640 ? 340 : 400, cardWidth, shellRect.width);
    const gap = 0;
    const anchorCenter = (priceRect ? priceRect.left + priceRect.width / 2 : rect.left + rect.width / 2) - shellRect.left;
    const left = Math.min(
      Math.max(anchorCenter - popupWidth / 2, cardLeft),
      Math.max(cardRight - popupWidth, cardLeft),
    );
    const top = rect.bottom - shellRect.top + gap;
    const arrowLeft = Math.min(Math.max(anchorCenter - left, 26), popupWidth - 26);

    setPopoverPlacement("below");
    setPopoverStyle({
      left,
      top,
      width: popupWidth,
      "--seo-popover-arrow-left": `${arrowLeft}px`,
    });
  }, []);

  const openDeal = (deal, index, event) => {
    setActiveDeal(deal);
    setActiveIndex(index);
    positionPopover(event.currentTarget);
    setTripType("round");
    setDepartureDate(defaultDepartureDate());
    setReturnDate(defaultReturnDate());
    setTravelers(defaultTravelers);
    setRouting(false);
  };

  const updateTripType = (nextType) => {
    setTripType(nextType);
    if (nextType === "oneway") {
      setReturnDate(null);
      return;
    }
    if (!returnDate && departureDate) {
      setReturnDate(addDays(departureDate, 1));
    }
  };

  const chooseDeparture = (date) => {
    setDepartureDate(date);
    if (tripType === "round" && returnDate && returnDate.getTime() < date.getTime()) {
      setReturnDate(addDays(date, 1));
    }
  };

  const updateTraveler = (key, amount) => {
    setTravelers((current) => ({
      ...current,
      [key]: Math.max(key === "adults" ? 1 : 0, current[key] + amount),
    }));
  };

  const handleSearch = () => {
    if (!activeDeal || !canSearch || !departureDate) return;
    const selectedReturnDate = tripType === "round" ? returnDate : null;
    if (tripType === "round" && !selectedReturnDate) return;

    const criteria = {
      tripType,
      from: airportFromDeal(activeDeal.from, activeDeal.fromCode),
      to: airportFromDeal(activeDeal.to, activeDeal.toCode),
      departureDate,
      returnDate: selectedReturnDate,
      travelers,
    };

    saveSearchCriteria(criteria);
    setRouting(true);
    router.push("/business-ops/tripfindbox/search/loading");
  };

  useEffect(() => {
    if (!activeDeal) return;

    const updatePosition = () => {
      if (activeIndex === null) return;
      const card = cardRefs.current[activeIndex];
      if (card) positionPopover(card);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveDeal(null);
        setActiveIndex(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
    };
  }, [activeDeal, activeIndex, positionPopover]);

  const travelerRows = useMemo(
    () => [
      { key: "adults", label: "Adult" },
      { key: "children", label: "Child (2-11)" },
      { key: "infants", label: "Infant" },
    ],
    [],
  );

  return (
    <div ref={shellRef} className="seo-route-deals-shell">
      <div className="site-route-deals-grid">
        {deals.map((deal, index) => (
          <button
            key={`${deal.from}-${deal.to}-${index}`}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            type="button"
            className={`site-route-deal-card seo-route-deal-button${activeDeal === deal ? " is-active" : ""}`}
            onClick={(event) => openDeal(deal, index, event)}
          >
            <div>
              <span>{deal.date}</span>
              <strong>{deal.from} › {deal.to}</strong>
            </div>
            <div className="seo-route-deal-price">
              <b>From {deal.price}</b>
              <small>RoundTrip</small>
            </div>
          </button>
        ))}
      </div>

      {activeDeal ? (
        <div
          className={`seo-card-search-popover seo-card-search-popover-${popoverPlacement}`}
          style={popoverStyle}
          role="dialog"
          aria-modal="false"
          aria-label={`${activeTitle} search form`}
        >
          <button type="button" className="seo-card-search-close" aria-label="Close search form" onClick={() => {
            setActiveDeal(null);
            setActiveIndex(null);
          }}>
            <X size={22} />
          </button>
          <h3>{activeTitle}</h3>
          <div className="seo-card-trip-tabs" aria-label="Trip type">
            <button type="button" className={tripType === "round" ? "is-active" : ""} onClick={() => updateTripType("round")}>
              Round Trip
            </button>
            <button type="button" className={tripType === "oneway" ? "is-active" : ""} onClick={() => updateTripType("oneway")}>
              One Way
            </button>
          </div>

          <div className={`seo-card-date-grid${tripType === "oneway" ? " is-oneway" : ""}`}>
            <DatePickerPopup
              label="Departure date"
              value={departureDate}
              departureDate={departureDate}
              returnDate={returnDate}
              selecting="departure"
              onSelect={chooseDeparture}
              compact
            />
            {tripType === "round" ? (
              <DatePickerPopup
                label="Return date"
                value={returnDate}
                departureDate={departureDate}
                returnDate={returnDate}
                selecting="return"
                minDate={departureDate}
                onSelect={setReturnDate}
                compact
              />
            ) : null}
          </div>

          <div className="seo-card-traveler-grid">
            {travelerRows.map((row) => (
              <div key={row.key} className="seo-card-traveler-row">
                <span>{row.label}</span>
                <div>
                  <button type="button" aria-label={`Decrease ${row.label}`} onClick={() => updateTraveler(row.key, -1)}>
                    <Minus size={15} />
                  </button>
                  <b>{travelers[row.key]}</b>
                  <button type="button" aria-label={`Increase ${row.label}`} onClick={() => updateTraveler(row.key, 1)}>
                    <Plus size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="seo-card-search-submit" disabled={!canSearch || routing} onClick={handleSearch}>
            <Search size={18} />
            {routing ? "Opening..." : "Search"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
