"use client";

import { ArrowDownUp, ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { closeAllBookingPopups } from "@/app/bops/tripfindbox/lib/bookingPopupBus";
import { saveSearchCriteria } from "@/app/bops/tripfindbox/lib/searchSession";
import AirportSelect from "./AirportSelect";
import DatePickerPopup from "./DatePickerPopup";
import TravelerCabinDropdown from "./TravelerCabinDropdown";
import TripTypeToggle from "./TripTypeToggle";

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function defaultDepartureDate() {
  return stripTime(new Date());
}

function defaultReturnDate(departureDate) {
  return addDays(departureDate, 1);
}

export default function FlightSearchBox({ compact = false, initialCriteria = null, onSearchSubmit }) {
  const router = useRouter();
  const [tripType, setTripType] = useState(initialCriteria?.tripType ?? "round");
  const [from, setFrom] = useState(initialCriteria?.from ?? null);
  const [to, setTo] = useState(initialCriteria?.to ?? null);
  const [departureDate, setDepartureDate] = useState(() => initialCriteria?.departureDate ?? defaultDepartureDate());
  const [returnDate, setReturnDate] = useState(() => {
    if (initialCriteria?.returnDate) return initialCriteria.returnDate;
    const departure = initialCriteria?.departureDate ?? defaultDepartureDate();
    return defaultReturnDate(departure);
  });
  const [travelers, setTravelers] = useState(
    initialCriteria?.travelers ?? { adults: 1, children: 0, infants: 0, cabin: "Economy" },
  );
  const [errors, setErrors] = useState({});
  const [routing, setRouting] = useState(false);

  const chooseDeparture = (date) => {
    setDepartureDate(date);
    if (returnDate && returnDate.getTime() < date.getTime()) {
      setReturnDate(defaultReturnDate(date));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!from) nextErrors.from = "Choose a departure city.";
    if (!to) nextErrors.to = "Choose a destination city.";
    if (from && to && from.code === to.code) nextErrors.to = "From and To cannot match.";
    if (!departureDate) nextErrors.departure = "Choose a departure date.";
    if (tripType === "round" && !returnDate) nextErrors.return = "Choose a return date.";
    if (tripType === "round" && departureDate && returnDate && returnDate.getTime() < departureDate.getTime()) {
      nextErrors.return = "Return must be after departure.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSearch = async () => {
    closeAllBookingPopups();
    if (!validate() || !from || !to || !departureDate) return;
    const criteria = { tripType, from, to, departureDate, returnDate, travelers };
    saveSearchCriteria(criteria);
    setRouting(true);
    if (onSearchSubmit) {
      try {
        await onSearchSubmit(criteria);
      } finally {
        setRouting(false);
      }
      return;
    }
    router.push("/bops/tripfindbox/search/loading");
  };

  return (
    <section className={`flight-search relative z-20 mx-auto w-full max-w-[1420px] ${compact ? "" : "px-4 pb-14 sm:px-6 lg:px-8"}`}>
      <div className="flight-search-toggle flex justify-center">
        <TripTypeToggle
          tripType={tripType}
          onChange={(type) => {
            setTripType(type);
            if (type === "oneway") {
              setReturnDate(null);
            } else if (!returnDate && departureDate) {
              setReturnDate(defaultReturnDate(departureDate));
            }
          }}
        />
      </div>
      <div className="flight-search-shell bg-white">
        <div className="flight-search-grid grid">
          <AirportSelect label="From" value={from} onChange={setFrom} error={errors.from} />
          <button
            type="button"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            className="route-swap"
            aria-label="Swap departure and destination"
          >
            <ArrowLeftRight className="route-swap-desktop-icon" size={19} />
            <ArrowDownUp className="route-swap-mobile-icon" size={19} />
          </button>
          <AirportSelect label="To" value={to} onChange={setTo} error={errors.to} />
          <div className={`date-group ${tripType !== "round" ? "date-group-oneway" : ""}`}>
            <DatePickerPopup
              label="Departure date"
              value={departureDate}
              departureDate={departureDate}
              returnDate={returnDate}
              selecting="departure"
              onSelect={chooseDeparture}
              error={errors.departure}
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
                error={errors.return}
              />
            ) : (
              <div className="date-placeholder" aria-hidden="true" />
            )}
          </div>
          <TravelerCabinDropdown value={travelers} onChange={setTravelers} />
          <button
            type="button"
            onMouseDown={closeAllBookingPopups}
            onClick={handleSearch}
            disabled={routing}
            className="flex h-[56px] items-center justify-center rounded-full bg-[#2E3192] px-6 text-base font-black text-white shadow-xl shadow-[#2E3192]/25 transition hover:bg-[#2E3192] disabled:cursor-wait disabled:opacity-80 md:h-[56px]"
          >
            {routing ? "Opening..." : "Search"}
          </button>
        </div>
      </div>
    </section>
  );
}
