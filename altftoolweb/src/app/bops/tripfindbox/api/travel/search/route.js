import { NextResponse } from "next/server";

const AIRLINE_NAMES = {
  AA: "American Airlines",
  DL: "Delta Air Lines",
  UA: "United Airlines",
  WN: "Southwest Airlines",
  B6: "JetBlue Airways",
  AS: "Alaska Airlines",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  HA: "Hawaiian Airlines",
  G4: "Allegiant Air",
};

function estimateSeed(criteria, index) {
  const value = `${criteria.from.code}${criteria.to.code}${criteria.departureDate}${criteria.tripType}${index}`;
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function formatTime(value) {
  if (!value) return "--";

  const timeMatch = value.match(/[T\s](\d{2}:\d{2})/) ?? value.match(/(\d{2}:\d{2})/);
  if (timeMatch?.[1]) return timeMatch[1];

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/New_York",
    }).format(date);
  }

  return "--";
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return "Schedule";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

function formatStops(count) {
  if (!count || count <= 0) return "Non-stop";
  return `${count} stop${count > 1 ? "s" : ""}`;
}

// AirLabs' /v9/schedules endpoint returns no fare data, so this is a rough
// placeholder range for display purposes only — never a real, bookable price.
function buildPriceEstimate(criteria, index) {
  const base = 145 + (estimateSeed(criteria, index) % 280);
  const travelerCount = criteria.travelers.adults + criteria.travelers.children + criteria.travelers.infants;
  const tripBoost = criteria.tripType === "round" ? 1.7 : 1;
  const cabinBoost = {
    Economy: 1,
    "Premium Economy": 1.3,
    Business: 2.25,
    First: 3,
  }[criteria.travelers.cabin];

  return Math.round(base * Math.max(travelerCount, 1) * tripBoost * cabinBoost);
}

function normalizeAirLabsSchedules(schedules, criteria) {
  return schedules.slice(0, 10).map((schedule, index) => {
    const airlineCode = schedule.airline_iata?.toUpperCase() ?? "";
    const carrier = AIRLINE_NAMES[airlineCode] ?? schedule.airline_icao ?? schedule.flight_iata ?? "AirLabs Schedule";
    const statusLabel = schedule.status ? schedule.status.replaceAll("_", " ") : "scheduled";

    return {
      id: schedule.flight_iata ?? schedule.flight_icao ?? `${criteria.from.code}-${criteria.to.code}-${index}`,
      provider: carrier,
      departTime: formatTime(schedule.dep_time),
      arriveTime: formatTime(schedule.arr_time),
      duration: formatDuration(schedule.duration),
      price: buildPriceEstimate(criteria, index),
      isEstimatedPrice: true,
      stops: "Non-stop",
      baggage: "Baggage rules vary by airline",
      tag: `${statusLabel} flight · estimated price`,
    };
  });
}

function encodePathPart(value) {
  return encodeURIComponent(String(value));
}

function cabinForFlightApi(cabin) {
  return cabin === "Premium Economy" ? "Premium_Economy" : cabin;
}

function parseAmount(value) {
  const amount = typeof value?.amount === "string" ? Number(value.amount) : value?.amount;
  return Number.isFinite(amount) && amount && amount > 0 ? amount : null;
}

function cheapestItineraryPrice(itinerary) {
  const prices = [
    parseAmount(itinerary.cheapest_price),
    ...(itinerary.pricing_options ?? []).flatMap((option) => [
      parseAmount(option.price),
      ...(option.items ?? []).map((item) => parseAmount(item.price)),
    ]),
  ].filter((price) => price !== null);

  return prices.length ? Math.min(...prices) : null;
}

function createEntityLookup(entities) {
  const lookup = new Map();

  if (Array.isArray(entities)) {
    for (const entity of entities) {
      if (entity.id !== undefined) lookup.set(String(entity.id), entity);
      if (entity.code) lookup.set(entity.code, entity);
      if (entity.display_code) lookup.set(entity.display_code, entity);
    }
  } else if (entities) {
    for (const [key, entity] of Object.entries(entities)) {
      lookup.set(key, entity);
      if (entity.id !== undefined) lookup.set(String(entity.id), entity);
      if (entity.code) lookup.set(entity.code, entity);
      if (entity.display_code) lookup.set(entity.display_code, entity);
    }
  }

  return lookup;
}

function carrierNameForLeg(leg, carriers) {
  const carrierId = leg?.marketing_carrier_ids?.[0] ?? leg?.operating_carrier_ids?.[0];
  if (carrierId === undefined) return "Live Flight Deal";

  const carrier = carriers.get(String(carrierId));
  return carrier?.name ?? carrier?.display_code ?? carrier?.code ?? String(carrierId);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeFlightApiResults(payload, criteria) {
  const legById = new Map((payload.legs ?? []).filter((leg) => leg.id).map((leg) => [leg.id, leg]));
  const carriers = createEntityLookup(payload.carriers);

  return (payload.itineraries ?? [])
    .map((itinerary, index) => {
      const price = cheapestItineraryPrice(itinerary);
      if (!price) return null;

      const legs = (itinerary.leg_ids ?? []).map((id) => legById.get(id)).filter((leg) => Boolean(leg));
      const outboundLeg = legs[0] ?? payload.legs?.[0];
      const totalStops = legs.length ? legs.reduce((total, leg) => total + (leg.stop_count ?? 0), 0) : outboundLeg?.stop_count;
      const totalDuration = legs.length ? legs.reduce((total, leg) => total + (leg.duration ?? 0), 0) : outboundLeg?.duration;

      return {
        id: itinerary.id ?? `${criteria.from.code}-${criteria.to.code}-flightapi-${index}`,
        provider: carrierNameForLeg(outboundLeg, carriers),
        departTime: formatTime(outboundLeg?.departure),
        arriveTime: formatTime(outboundLeg?.arrival),
        duration: formatDuration(totalDuration),
        price: Math.round(price),
        isEstimatedPrice: false,
        stops: formatStops(totalStops),
        baggage: "Live fare data; baggage rules vary by airline and vendor",
        tag: "live FlightAPI fare",
      };
    })
    .filter((result) => Boolean(result))
    .sort((a, b) => a.price - b.price)
    .slice(0, 10);
}

async function searchFlightApi(criteria) {
  const apiKey = process.env.FLIGHTAPI_IO_KEY;

  if (!apiKey) {
    return [];
  }

  const travelerCount = {
    adults: Math.max(criteria.travelers.adults, 1),
    children: Math.max(criteria.travelers.children, 0),
    infants: Math.max(criteria.travelers.infants, 0),
  };
  const cabin = cabinForFlightApi(criteria.travelers.cabin);
  const currency = "USD";
  const baseParts = [
    apiKey,
    criteria.from.code,
    criteria.to.code,
    criteria.departureDate,
  ];

  const endpointParts =
    criteria.tripType === "round" && criteria.returnDate
      ? ["roundtrip", ...baseParts, criteria.returnDate, travelerCount.adults, travelerCount.children, travelerCount.infants, cabin, currency]
      : ["onewaytrip", ...baseParts, travelerCount.adults, travelerCount.children, travelerCount.infants, cabin, currency];

  const url = `https://api.flightapi.io/${endpointParts.map(encodePathPart).join("/")}`;
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": "TripFindBox/1.0 (+https://tripfindbox.com)",
        },
      });

      if (!response.ok) {
        lastError = new Error(`FlightAPI search failed with ${response.status}`);
        if ([400, 408, 429, 500, 502, 503, 504].includes(response.status) && attempt < 2) {
          await wait(700 * (attempt + 1));
          continue;
        }
        throw lastError;
      }

      const payload = await response.json();
      if (payload.error) {
        const message = typeof payload.error === "string" ? payload.error : payload.error.message;
        throw new Error(message ?? payload.message ?? "FlightAPI returned an error");
      }

      return normalizeFlightApiResults(payload, criteria);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("FlightAPI search failed");
}

async function searchAirLabs(criteria) {
  const apiKey = process.env.AIRLABS_API_KEY;

  if (!apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    dep_iata: criteria.from.code,
    arr_iata: criteria.to.code,
    limit: "50",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`https://airlabs.co/api/v9/schedules?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`AirLabs search failed with ${response.status}`);
    }

    const payload = await response.json();
    if (payload.error) {
      throw new Error(payload.error.message ?? payload.error.code ?? "AirLabs returned an error");
    }

    const matches = (payload.response ?? []).filter((schedule) => {
      const dep = schedule.dep_iata?.toUpperCase();
      const arr = schedule.arr_iata?.toUpperCase();
      return dep === criteria.from.code && arr === criteria.to.code;
    });

    return normalizeAirLabsSchedules(matches, criteria);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  const criteria = await request.json();

  try {
    const flightApiResults = await searchFlightApi(criteria);
    if (flightApiResults.length) {
      return NextResponse.json({ source: "flightapi", results: flightApiResults });
    }

    const airLabsResults = await searchAirLabs(criteria);
    return NextResponse.json({ source: "airlabs-fallback", results: airLabsResults });
  } catch (error) {
    console.error(error);
    try {
      const results = await searchAirLabs(criteria);
      return NextResponse.json({ source: "airlabs-fallback", results }, { status: 200 });
    } catch (fallbackError) {
      console.error(fallbackError);
      return NextResponse.json({ source: "travel-search-error", results: [] }, { status: 200 });
    }
  }
}
