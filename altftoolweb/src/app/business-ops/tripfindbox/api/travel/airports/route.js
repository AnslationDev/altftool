import { NextResponse } from "next/server";
import { airports as fallbackAirports } from "@/app/business-ops/tripfindbox/lib/travelApi";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const POPULAR_CODES = new Set(["JFK", "LGA", "EWR", "LAX", "ORD", "DFW", "MIA", "ATL", "SFO", "SEA", "BOS", "DEN", "LAS", "MCO", "CDG", "ORY", "LHR", "DXB", "DEL", "BOM"]);

let airportCache = null;
let airportCachePromise = null;

function countryName(countryCode) {
  if (!countryCode) return "";

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode.toUpperCase()) ?? countryCode.toUpperCase();
  } catch {
    return countryCode.toUpperCase();
  }
}

function displayCity(name) {
  return name
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\b(International|Regional|Municipal|Domestic|Metropolitan|Intercontinental)\b/gi, "")
    .replace(/\b(Airport|Airfield|Heliport|Aerodrome|Seaplane Base|Bus Station)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || name;
}

function normalizeAirport(airport) {
  const code = airport.iata_code?.trim().toUpperCase() ?? "";
  const name = airport.name?.trim();

  if (!/^[A-Z]{3}$/.test(code) || !name) return null;
  if (/\b(bus|ferry|rail|railway|train|station)\b/i.test(name)) return null;

  const country = countryName(airport.country_code);
  return {
    city: displayCity(name),
    code,
    airport: country ? `${name}, ${country}` : name,
  };
}

function normalizeFlightApiAirport(airport) {
  const code = (airport.iata || airport.fs || "").trim().toUpperCase();
  const name = airport.name?.trim();

  if (!/^[A-Z]{3}$/.test(code) || !name) return null;
  if (/\b(bus|ferry|rail|railway|train|station)\b/i.test(name)) return null;

  return {
    city: displayCity(name),
    code,
    airport: name,
  };
}

async function searchFlightApiAirports(query) {
  const apiKey = process.env.FLIGHTAPI_IO_KEY;
  if (!apiKey || !query) return [];

  const params = new URLSearchParams({
    name: query,
    type: "airport",
  });

  const response = await fetch(`https://api.flightapi.io/iata/${encodeURIComponent(apiKey)}?${params.toString()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`FlightAPI airports failed with ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    const message = typeof payload.error === "string" ? payload.error : payload.error.message;
    throw new Error(message ?? payload.message ?? "FlightAPI airports returned an error");
  }

  return (payload.data ?? [])
    .map(normalizeFlightApiAirport)
    .filter((airport) => Boolean(airport));
}

async function loadAirports() {
  const now = Date.now();
  if (airportCache && airportCache.expiresAt > now) return airportCache.airports;
  if (airportCachePromise) return airportCachePromise;

  airportCachePromise = (async () => {
    const apiKey = process.env.AIRLABS_API_KEY;
    if (!apiKey) return fallbackAirports;

    const params = new URLSearchParams({
      api_key: apiKey,
      limit: "30000",
    });
    const response = await fetch(`https://airlabs.co/api/v9/airports?${params.toString()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`AirLabs airports failed with ${response.status}`);
    }

    const payload = await response.json();
    if (payload.error) {
      throw new Error(payload.error.message ?? payload.error.code ?? "AirLabs airports returned an error");
    }

    const byCode = new Map();
    for (const airport of payload.response ?? []) {
      const normalized = normalizeAirport(airport);
      if (normalized && !byCode.has(normalized.code)) {
        byCode.set(normalized.code, normalized);
      }
    }

    const airports = Array.from(byCode.values());
    airportCache = {
      airports: airports.length ? airports : fallbackAirports,
      expiresAt: now + CACHE_TTL_MS,
    };
    return airportCache.airports;
  })();

  try {
    return await airportCachePromise;
  } finally {
    airportCachePromise = null;
  }
}

function scoreAirport(airport, term) {
  const code = airport.code.toLowerCase();
  const city = airport.city.toLowerCase();
  const name = airport.airport.toLowerCase();

  if (code === term) return 0;
  if (city === term) return 1;
  if (city.startsWith(term)) return 2;
  if (name.startsWith(term)) return 3;
  if (code.startsWith(term)) return 4;
  if (name.includes(term)) return 5;
  if (city.includes(term)) return 6;
  return 99;
}

function popularAirports(airports) {
  return airports
    .filter((airport) => POPULAR_CODES.has(airport.code))
    .sort((a, b) => Array.from(POPULAR_CODES).indexOf(a.code) - Array.from(POPULAR_CODES).indexOf(b.code))
    .slice(0, 12);
}

function mergeAirports(primary, secondary) {
  const byCode = new Map();
  for (const airport of [...primary, ...secondary]) {
    if (!byCode.has(airport.code)) byCode.set(airport.code, airport);
  }
  return Array.from(byCode.values());
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  try {
    const airports = await loadAirports();
    if (!query) {
      return NextResponse.json({ source: "airlabs", results: popularAirports(airports) });
    }

    let flightApiResults = [];
    try {
      flightApiResults = await searchFlightApiAirports(query);
    } catch (error) {
      console.error(error);
    }

    const backupResults = airports
          .filter((airport) => `${airport.city} ${airport.code} ${airport.airport}`.toLowerCase().includes(query))
          .sort((a, b) => scoreAirport(a, query) - scoreAirport(b, query) || a.city.localeCompare(b.city))
          .slice(0, 30);
    const results = mergeAirports(flightApiResults, backupResults).slice(0, 30);

    return NextResponse.json({
      source: flightApiResults.length ? "flightapi+airlabs" : "airlabs",
      results,
    });
  } catch (error) {
    console.error(error);
    const results = query
      ? fallbackAirports.filter((airport) => `${airport.city} ${airport.code} ${airport.airport}`.toLowerCase().includes(query))
      : fallbackAirports;

    return NextResponse.json({ source: "fallback", results: results.slice(0, 20) }, { status: 200 });
  }
}
