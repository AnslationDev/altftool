"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  ArrowLeft,
  ChevronRight,
  Compass,
  Contrast,
  ExternalLink,
  Globe2,
  Heart,
  Languages,
  Loader2,
  LocateFixed,
  Lock,
  Map as MapIcon,
  Menu,
  Minus,
  Moon,
  Navigation,
  Play,
  Plus,
  Radio,
  Search,
  Settings,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Smartphone,
  Sparkles,
  Unlock,
  Volume2,
  X,
} from "lucide-react";
import "./radio-garden.css";

const ASSET_BASE = "/radio-garden-assets";
const RADIO_API = "https://de1.api.radio-browser.info/json";
const MAX_LIVE_STATIONS = 520;
const CAMERA_BASE_Z = 8.85;
const CAMERA_ZOOM_STEP = 0.48;

const COUNTRY_CENTERS = {
  NP: { lat: 27.7172, lng: 85.324, city: "Kathmandu", country: "Nepal" },
  IN: { lat: 28.6139, lng: 77.209, city: "New Delhi", country: "India" },
  US: { lat: 40.7128, lng: -74.006, city: "New York", country: "United States" },
  GB: { lat: 51.5072, lng: -0.1276, city: "London", country: "United Kingdom" },
  FR: { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
  DE: { lat: 52.52, lng: 13.405, city: "Berlin", country: "Germany" },
  NL: { lat: 52.3676, lng: 4.9041, city: "Amsterdam", country: "Netherlands" },
  JP: { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
  AU: { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
  BR: { lat: -22.9068, lng: -43.1729, city: "Rio de Janeiro", country: "Brazil" },
  ZA: { lat: -33.9249, lng: 18.4241, city: "Cape Town", country: "South Africa" },
  ES: { lat: 40.4168, lng: -3.7038, city: "Madrid", country: "Spain" },
  IT: { lat: 41.9028, lng: 12.4964, city: "Rome", country: "Italy" },
  CA: { lat: 43.6532, lng: -79.3832, city: "Toronto", country: "Canada" },
  MX: { lat: 19.4326, lng: -99.1332, city: "Mexico City", country: "Mexico" },
  AR: { lat: -34.6037, lng: -58.3816, city: "Buenos Aires", country: "Argentina" },
  SG: { lat: 1.3521, lng: 103.8198, city: "Singapore", country: "Singapore" },
  AE: { lat: 25.2048, lng: 55.2708, city: "Dubai", country: "United Arab Emirates" },
};

const LANGUAGE_PRESETS = [
  { label: "Hindi", query: "hindi", api: { language: "hindi" } },
  { label: "Punjabi", query: "punjabi", api: { language: "punjabi" } },
  { label: "Bhojpuri", query: "bhojpuri", api: { tag: "bhojpuri" } },
  { label: "Haryanvi", query: "haryanvi", api: { tag: "haryanvi" } },
  { label: "Nepali", query: "nepali", api: { language: "nepali" } },
  { label: "Urdu", query: "urdu", api: { language: "urdu" } },
  { label: "Tamil", query: "tamil", api: { language: "tamil" } },
  { label: "Telugu", query: "telugu", api: { language: "telugu" } },
  { label: "Bengali", query: "bengali", api: { language: "bengali" } },
  { label: "Marathi", query: "marathi", api: { language: "marathi" } },
  { label: "English", query: "english", api: { language: "english" } },
  { label: "Spanish", query: "spanish", api: { language: "spanish" } },
  { label: "Arabic", query: "arabic", api: { language: "arabic" } },
];

const INDIAN_REGION_HINTS = [
  { match: /bhojpuri|bihar|patna|chhapra|banaras|varanasi/, city: "Patna", lat: 25.5941, lng: 85.1376 },
  { match: /haryanvi|haryana|kasoot|rohtak|hisar|gurugram|gurgaon/, city: "Rohtak", lat: 28.8955, lng: 76.6066 },
  { match: /punjabi|punjab|sikh|amritsar|ludhiana|jalandhar/, city: "Amritsar", lat: 31.634, lng: 74.8723 },
  { match: /hindi|bollywood|vividh|delhi|uttar pradesh|lucknow/, city: "New Delhi", lat: 28.6139, lng: 77.209 },
  { match: /marathi|maharashtra|pune|mumbai/, city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { match: /tamil|chennai|tamil nadu/, city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { match: /telugu|hyderabad|andhra|telangana/, city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { match: /bengali|bangla|kolkata|west bengal/, city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { match: /gujarati|gujarat|ahmedabad/, city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { match: /kannada|bengaluru|bangalore|karnataka/, city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { match: /malayalam|kerala|kochi/, city: "Kochi", lat: 9.9312, lng: 76.2673 },
];

const SEED_STATIONS = [
  {
    id: "seed-bardiya-1",
    name: "BBC Nepali",
    city: "Bardiya",
    country: "Nepal",
    countryCode: "NP",
    lat: 28.31,
    lng: 81.43,
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_nepali_radio",
    homepage: "https://www.bbc.com/nepali",
    tags: "news,nepali",
    votes: 6066,
  },
  {
    id: "seed-kathmandu-1",
    name: "BBC Nepali 103 MHz",
    city: "Kathmandu",
    country: "Nepal",
    countryCode: "NP",
    lat: 27.7172,
    lng: 85.324,
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_nepali_radio",
    homepage: "https://www.bbc.com/nepali",
    tags: "news,nepali",
    votes: 1038,
  },
  {
    id: "seed-kathmandu-2",
    name: "BFBS Gurkha Radio",
    city: "Kathmandu",
    country: "Nepal",
    countryCode: "NP",
    lat: 27.706,
    lng: 85.333,
    url: "https://listen-ssvcbfbs.sharp-stream.com/ssvcbfbs3.aac",
    homepage: "https://radio.bfbs.com/stations/bfbs-gurkha-network",
    tags: "gurkha,nepali",
    votes: 202,
  },
  {
    id: "seed-lucknow-1",
    name: "Radio City Hindi",
    city: "Lucknow",
    country: "India",
    countryCode: "IN",
    lat: 26.8467,
    lng: 80.9462,
    url: "https://prclive1.listenon.in/",
    homepage: "https://www.radiocity.in/",
    tags: "hindi,music",
    votes: 920,
  },
  {
    id: "seed-delhi-1",
    name: "AIR Vividh Bharati",
    city: "New Delhi",
    country: "India",
    countryCode: "IN",
    lat: 28.6139,
    lng: 77.209,
    url: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8",
    homepage: "https://prasarbharati.gov.in/",
    tags: "classic,hindi",
    votes: 1880,
  },
  {
    id: "seed-ny-1",
    name: "KEXP 90.3 FM",
    city: "Seattle",
    country: "United States",
    countryCode: "US",
    lat: 47.6062,
    lng: -122.3321,
    url: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
    homepage: "https://www.kexp.org/",
    tags: "indie,alternative",
    votes: 5400,
  },
  {
    id: "seed-soma-1",
    name: "SomaFM Groove Salad",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    lat: 37.7749,
    lng: -122.4194,
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
    homepage: "https://somafm.com/groovesalad/",
    tags: "ambient,electronic",
    votes: 8300,
  },
  {
    id: "seed-soma-2",
    name: "SomaFM Drone Zone",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    lat: 37.804,
    lng: -122.271,
    url: "https://ice1.somafm.com/dronezone-128-mp3",
    homepage: "https://somafm.com/dronezone/",
    tags: "ambient,space",
    votes: 6100,
  },
  {
    id: "seed-london-1",
    name: "BBC World Service",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    lat: 51.5072,
    lng: -0.1276,
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
    homepage: "https://www.bbc.co.uk/worldserviceradio",
    tags: "news,world",
    votes: 7600,
  },
  {
    id: "seed-london-2",
    name: "NTS Radio",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    lat: 51.536,
    lng: -0.076,
    url: "https://stream-relay-geo.ntslive.net/stream",
    homepage: "https://www.nts.live/",
    tags: "eclectic,underground",
    votes: 4300,
  },
  {
    id: "seed-paris-1",
    name: "FIP",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    lat: 48.8566,
    lng: 2.3522,
    url: "https://icecast.radiofrance.fr/fip-midfi.mp3",
    homepage: "https://www.radiofrance.fr/fip",
    tags: "jazz,world",
    votes: 6800,
  },
  {
    id: "seed-paris-2",
    name: "France Inter",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    lat: 48.842,
    lng: 2.309,
    url: "https://icecast.radiofrance.fr/franceinter-midfi.mp3",
    homepage: "https://www.radiofrance.fr/franceinter",
    tags: "news,culture",
    votes: 5200,
  },
  {
    id: "seed-berlin-1",
    name: "FluxFM",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    lat: 52.52,
    lng: 13.405,
    url: "https://streams.fluxfm.de/live/mp3-128/streams.fluxfm.de/",
    homepage: "https://www.fluxfm.de/",
    tags: "indie,electronic",
    votes: 2800,
  },
  {
    id: "seed-amsterdam-1",
    name: "Radio Paradise Main Mix",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    lat: 52.3676,
    lng: 4.9041,
    url: "https://stream.radioparadise.com/mp3-192",
    homepage: "https://radioparadise.com/",
    tags: "eclectic,rock",
    votes: 7200,
  },
  {
    id: "seed-tokyo-1",
    name: "J1 Radio",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    lat: 35.6762,
    lng: 139.6503,
    url: "https://jenny.torontocast.com:2000/stream/j1radio",
    homepage: "https://j1fm.tokyo/",
    tags: "jpop,japan",
    votes: 1700,
  },
  {
    id: "seed-sydney-1",
    name: "ABC Jazz",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    lat: -33.8688,
    lng: 151.2093,
    url: "https://live-radio01.mediahubaustralia.com/JAZW/mp3/",
    homepage: "https://www.abc.net.au/jazz/",
    tags: "jazz",
    votes: 2400,
  },
  {
    id: "seed-rio-1",
    name: "Radio JB FM",
    city: "Rio de Janeiro",
    country: "Brazil",
    countryCode: "BR",
    lat: -22.9068,
    lng: -43.1729,
    url: "https://26643.live.streamtheworld.com/JBFMAAC.aac",
    homepage: "https://jb.fm/",
    tags: "brazil,pop",
    votes: 2100,
  },
  {
    id: "seed-cape-1",
    name: "Cape Town Radio",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    lat: -33.9249,
    lng: 18.4241,
    url: "https://edge.iono.fm/xice/48_medium.aac",
    homepage: "https://iono.fm/",
    tags: "talk,music",
    votes: 980,
  },
  {
    id: "seed-madrid-1",
    name: "Radio Clasica",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    lat: 40.4168,
    lng: -3.7038,
    url: "https://rtvelivestream.akamaized.net/rtvesec/rne/rne_radioclasica_main.m3u8",
    homepage: "https://www.rtve.es/radio/radioclasica/",
    tags: "classical",
    votes: 1650,
  },
  {
    id: "seed-rome-1",
    name: "Venice Classic Radio",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    lat: 41.9028,
    lng: 12.4964,
    url: "https://uk2.streamingpulse.com/ssl/vcr1",
    homepage: "https://www.veniceclassicradio.eu/",
    tags: "classical",
    votes: 3100,
  },
  {
    id: "seed-toronto-1",
    name: "CBC Radio One",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    lat: 43.6532,
    lng: -79.3832,
    url: "https://cbcradiolive.akamaized.net/hls/live/2041035/ES_R1ETR/master.m3u8",
    homepage: "https://www.cbc.ca/listen/live-radio",
    tags: "news,canada",
    votes: 2600,
  },
  {
    id: "seed-singapore-1",
    name: "BBC World Service Asia",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    lat: 1.3521,
    lng: 103.8198,
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
    homepage: "https://www.bbc.co.uk/worldserviceradio",
    tags: "news,asia",
    votes: 1900,
  },
];

const PLAYLISTS = [
  {
    id: "rain-and-tears",
    name: "Rain & Tears",
    curator: "OpenAir Picks",
    tag: "New",
    count: 9,
    copy:
      "Folk songs, quiet voices and tender stations from cities that sound best after sunset.",
  },
  {
    id: "high-brow",
    name: "High Brow",
    curator: "Global Signals",
    count: 9,
    copy:
      "Classical music, cultural broadcasters and softer orchestral stations across the map.",
  },
  {
    id: "fringe-city",
    name: "Fringe City",
    curator: "Late Frequency",
    count: 8,
    copy:
      "Independent stations with experimental sounds, underground shows and restless local scenes.",
  },
  {
    id: "island-life",
    name: "Island Life",
    curator: "Team OpenAir",
    count: 6,
    copy:
      "A slow route through islands, coasts and warm-water stations scattered across the oceans.",
  },
];

const EXTRA_PLAYLISTS = [
  ["Time Travel", "Music and recordings that feel pulled from another decade."],
  ["Independent Sounds", "Small stations, tiny studios and stubborn local taste."],
  ["Energetic Rhythms", "Electronic sounds and danceable rhythm patterns."],
  ["Curiosa Cabinet", "Unusual stations from across the world wide web."],
  ["Global Jukebox", "A shuffled route through popular local favorites."],
  ["Snow Globe", "Winter broadcasts, soft classics and seasonal signals."],
];

function slugify(value) {
  return String(value || "station")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function jitter(seed, spread = 0.7) {
  const x = Math.sin(seed * 999) * 10000;
  return (x - Math.floor(x) - 0.5) * spread;
}

function normalizeStation(station, index) {
  const countryCode = station.countrycode || station.countryCode || "";
  const center = inferStationCenter(station, index);
  const lat = Number.isFinite(Number(station.geo_lat))
    ? Number(station.geo_lat)
    : Number.isFinite(Number(station.lat))
      ? Number(station.lat)
      : center.lat + jitter(index, 1.1);
  const lng = Number.isFinite(Number(station.geo_long))
    ? Number(station.geo_long)
    : Number.isFinite(Number(station.lng))
      ? Number(station.lng)
      : center.lng + jitter(index + 11, 1.1);

  const city = station.city || center.city || station.state || station.country || "Unknown place";

  return {
    id: station.stationuuid || station.id || `station-${index}`,
    name: station.name || "Untitled station",
    city,
    country: station.country || center.country || "Unknown country",
    countryCode,
    lat,
    lng,
    url: station.url_resolved || station.url || "",
    homepage: station.homepage || "",
    favicon: station.favicon && station.favicon !== "null" ? station.favicon : "",
    tags: station.tags || "",
    votes: Number(station.votes || 0),
    codec: station.codec || "",
    bitrate: station.bitrate || "",
  };
}

function dedupeStations(stations) {
  const seen = new Set();
  return stations.filter((station) => {
    const key = `${station.name}-${station.city}-${station.country}`.toLowerCase();
    if (seen.has(key) || !station.url) return false;
    seen.add(key);
    return true;
  });
}

function makePlaces(stations) {
  const placeMap = new Map();
  stations.forEach((station) => {
    const key = `${station.city}|${station.country}`;
    const current =
      placeMap.get(key) ||
      {
        id: slugify(key),
        city: station.city,
        country: station.country,
        countryCode: station.countryCode,
        lat: 0,
        lng: 0,
        stations: [],
      };

    current.stations.push(station);
    current.lat += station.lat;
    current.lng += station.lng;
    placeMap.set(key, current);
  });

  return Array.from(placeMap.values())
    .map((place) => ({
      ...place,
      lat: place.lat / place.stations.length,
      lng: place.lng / place.stations.length,
      stations: place.stations.sort((a, b) => b.votes - a.votes),
    }))
    .sort((a, b) => b.stations.length - a.stations.length || a.city.localeCompare(b.city));
}

function distanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * radius * Math.asin(Math.sqrt(h)));
}

function localTimeFromLng(lng) {
  const offsetMinutes = Math.round((lng / 15) * 60);
  const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
  return new Date(utc + offsetMinutes * 60000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function inferStationCenter(station, index) {
  const countryCode = station.countrycode || station.countryCode || "";
  const fallback = COUNTRY_CENTERS[countryCode] || {
    lat: 20 + jitter(index, 90),
    lng: jitter(index + 31, 240),
    city: station.state || station.country || "World",
    country: station.country || "Global",
  };

  if (countryCode !== "IN") return fallback;

  const text = `${station.name || ""} ${station.tags || ""} ${station.language || ""} ${
    station.state || ""
  }`.toLowerCase();
  const hint = INDIAN_REGION_HINTS.find((candidate) => candidate.match.test(text));
  if (!hint) return fallback;

  return {
    ...fallback,
    city: hint.city,
    country: "India",
    lat: hint.lat,
    lng: hint.lng,
  };
}

function latLngToVector(lat, lng, radius = 2.48) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function vectorToLatLng(vector) {
  const normalized = vector.clone().normalize();
  const lat = 90 - (Math.acos(THREE.MathUtils.clamp(normalized.y, -1, 1)) * 180) / Math.PI;
  const theta = Math.atan2(normalized.z, -normalized.x);
  let lng = (theta * 180) / Math.PI - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;
  return { lat, lng };
}

function nearestPlaceFromPoint(point, places) {
  return places
    .map((place) => ({ ...place, distance: distanceKm(point, place) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch (error) {
    return false;
  }
}

function GlobeScene({ places, activePlace, onSelectPlace, locked, zoomLevel, userLocation }) {
  const mountRef = useRef(null);
  const runtimeRef = useRef(null);
  const latestRef = useRef({ places, activePlace, onSelectPlace, locked });

  useEffect(() => {
    latestRef.current = { places, activePlace, onSelectPlace, locked };
  }, [places, activePlace, onSelectPlace, locked]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    if (!canUseWebGL()) {
      mount.classList.add("has-no-webgl");
      runtimeRef.current = {
        camera: null,
        renderer: null,
        markerGroup: null,
        rebuildMarkers: () => {},
        updateActiveRing: () => {},
        updateUserMarker: () => {},
        focusPlace: () => {},
      };
      return () => {
        mount.classList.remove("has-no-webgl");
      };
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
    } catch (error) {
      mount.classList.add("has-no-webgl");
      runtimeRef.current = {
        camera: null,
        renderer: null,
        markerGroup: null,
        rebuildMarkers: () => {},
        updateActiveRing: () => {},
        updateUserMarker: () => {},
        focusPlace: () => {},
      };
      return () => {
        mount.classList.remove("has-no-webgl");
      };
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, CAMERA_BASE_Z - CAMERA_ZOOM_STEP);
    renderer.setClearColor(0x1128ff, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = -0.2;
    globeGroup.rotation.y = -1.12;
    scene.add(globeGroup);

    const texture = new THREE.TextureLoader().load(`${ASSET_BASE}/earth-blue-marble.jpg`);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.45, 96, 96),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.84,
        metalness: 0.02,
      })
    );
    globeGroup.add(sphere);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.53, 96, 96),
      new THREE.MeshBasicMaterial({
        color: 0x64cfff,
        transparent: true,
        opacity: 0.09,
        side: THREE.BackSide,
      })
    );
    globeGroup.add(atmosphere);

    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    const activeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.016, 10, 64),
      new THREE.MeshBasicMaterial({ color: 0x8cf4ad, transparent: true, opacity: 0.92 })
    );
    activeRing.visible = false;
    globeGroup.add(activeRing);

    const userDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.043, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0x79e9ff, transparent: true, opacity: 0.98 })
    );
    const userHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.012, 10, 58),
      new THREE.MeshBasicMaterial({ color: 0x79e9ff, transparent: true, opacity: 0.86 })
    );
    userDot.visible = false;
    userHalo.visible = false;
    globeGroup.add(userHalo, userDot);

    const light = new THREE.DirectionalLight(0xffffff, 2.4);
    light.position.set(3, 2, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x9ec6ff, 1.55));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let dragDistance = 0;
    let lastX = 0;
    let lastY = 0;
    let animationId = 0;
    let pauseAutoRotateUntil = 0;

    function resize() {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function rebuildMarkers(nextPlaces) {
      markerGroup.clear();
      const dotGeometry = new THREE.SphereGeometry(0.022, 10, 10);
      nextPlaces.slice(0, 260).forEach((place, index) => {
        const dot = new THREE.Mesh(
          dotGeometry,
          new THREE.MeshBasicMaterial({
            color: index % 7 === 0 ? 0xb7ffd2 : 0x60f28b,
            transparent: true,
            opacity: 0.94,
          })
        );
        const scale = Math.min(2.2, 1 + place.stations.length * 0.16);
        dot.scale.setScalar(scale);
        dot.position.copy(latLngToVector(place.lat, place.lng, 2.52));
        dot.userData.placeId = place.id;
        markerGroup.add(dot);
      });
    }

    function updateActiveRing(nextPlace) {
      if (!nextPlace) {
        activeRing.visible = false;
        return;
      }
      const position = latLngToVector(nextPlace.lat, nextPlace.lng, 2.58);
      activeRing.position.copy(position);
      activeRing.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize()
      );
      activeRing.visible = true;
    }

    function updateUserMarker(location) {
      if (!location) {
        userDot.visible = false;
        userHalo.visible = false;
        return;
      }

      const position = latLngToVector(location.lat, location.lng, 2.63);
      userDot.position.copy(position);
      userHalo.position.copy(position);
      userHalo.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize()
      );
      userDot.visible = true;
      userHalo.visible = true;
    }

    function focusPlace(nextPlace) {
      if (!nextPlace) return;
      const target = latLngToVector(nextPlace.lat, nextPlace.lng, 1).normalize();
      const front = new THREE.Vector3(0, 0, 1);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(target, front);
      globeGroup.quaternion.copy(quaternion);
      pauseAutoRotateUntil = performance.now() + 2800;
      updateActiveRing(nextPlace);
    }

    function animate() {
      const { locked: isLocked } = latestRef.current;
      if (!dragging && !isLocked && performance.now() > pauseAutoRotateUntil) {
        globeGroup.rotation.y += 0.00055;
      }
      activeRing.rotation.z += 0.015;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }

    function pointerPosition(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function handlePointerDown(event) {
      dragging = true;
      dragDistance = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event) {
      if (!dragging || latestRef.current.locked) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      globeGroup.rotation.y += dx * 0.006;
      globeGroup.rotation.x += dy * 0.004;
      globeGroup.rotation.x = Math.max(-0.92, Math.min(0.92, globeGroup.rotation.x));
      lastX = event.clientX;
      lastY = event.clientY;
    }

    function handlePointerUp(event) {
      if (!dragging) return;
      dragging = false;
      renderer.domElement.releasePointerCapture?.(event.pointerId);
      if (dragDistance > 8) return;

      pointerPosition(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markerGroup.children, false);
      const hit = hits.find((item) => item.object.userData.placeId);
      if (hit) {
        const place = latestRef.current.places.find(
          (candidate) => candidate.id === hit.object.userData.placeId
        );
        if (place) latestRef.current.onSelectPlace(place, { openDrawer: true });
        return;
      }

      const globeHits = raycaster.intersectObject(sphere, false);
      if (!globeHits.length) return;
      const localPoint = globeGroup.worldToLocal(globeHits[0].point.clone());
      const nearest = nearestPlaceFromPoint(vectorToLatLng(localPoint), latestRef.current.places);
      if (nearest) latestRef.current.onSelectPlace(nearest, { openDrawer: true });
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerUp);

    runtimeRef.current = {
      camera,
      renderer,
      markerGroup,
      rebuildMarkers,
      updateActiveRing,
      updateUserMarker,
      focusPlace,
    };

    resize();
    rebuildMarkers(latestRef.current.places);
    focusPlace(latestRef.current.activePlace);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      texture.dispose();
    };
  }, []);

  useEffect(() => {
    runtimeRef.current?.rebuildMarkers(places);
  }, [places]);

  useEffect(() => {
    runtimeRef.current?.focusPlace?.(activePlace);
    runtimeRef.current?.updateActiveRing(activePlace);
  }, [activePlace]);

  useEffect(() => {
    runtimeRef.current?.updateUserMarker?.(userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (runtimeRef.current?.camera) {
      runtimeRef.current.camera.position.z = CAMERA_BASE_Z - zoomLevel * CAMERA_ZOOM_STEP;
      runtimeRef.current.camera.updateProjectionMatrix();
    }
  }, [zoomLevel]);

  return (
    <div
      ref={mountRef}
      className={`rg-globe-canvas ${userLocation ? "has-user-location" : ""}`}
      aria-label="interactive globe"
    >
      <div className="rg-earth-visual" aria-hidden="true">
        <span className="rg-earth-focus" />
        {userLocation && <span className="rg-user-earth-dot" />}
      </div>
    </div>
  );
}

function StationRow({ station, active, showPlace = false, onClick, onFavorite, favorite }) {
  return (
    <button
      type="button"
      className={`rg-list-row ${active ? "is-active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span>
        <strong>{station.name}</strong>
        {showPlace && (
          <small>
            {station.city}, {station.country}
          </small>
        )}
      </span>
      <span
        role="button"
        tabIndex={0}
        aria-label={`${favorite ? "remove" : "add"} ${station.name} to favorites`}
        className={`rg-row-heart ${favorite ? "is-saved" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          onFavorite(station);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onFavorite(station);
          }
        }}
      >
        <Heart size={21} />
      </span>
    </button>
  );
}

function IconNavButton({ active, label, icon: Icon, onClick }) {
  return (
    <button type="button" className={`rg-nav-item ${active ? "is-active" : ""}`} onClick={onClick}>
      <Icon size={25} />
      <span>{label}</span>
    </button>
  );
}

export default function RadioGardenClient() {
  const [stations, setStations] = useState(() => SEED_STATIONS.map(normalizeStation));
  const [activeTab, setActiveTab] = useState("explore");
  const [activePlace, setActivePlace] = useState(null);
  const [currentStation, setCurrentStation] = useState(null);
  const [started, setStarted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("openair-favorites") || "[]");
    } catch (error) {
      return [];
    }
  });
  const [status, setStatus] = useState("idle");
  const [volume, setVolume] = useState(0.8);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [locked, setLocked] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedStations, setExpandedStations] = useState(false);
  const [contrast, setContrast] = useState(false);
  const audioRef = useRef(null);

  const places = useMemo(() => makePlaces(stations), [stations]);
  const favoriteIds = useMemo(() => new Set(favorites.map((station) => station.id)), [favorites]);

  const findPlaceByName = useCallback(
    (name) => {
      const target = slugify(name);
      return (
        places.find((place) => slugify(place.city) === target) ||
        places.find((place) => slugify(place.country) === target) ||
        places.find((place) => slugify(`${place.city}-${place.country}`).includes(target))
      );
    },
    [places]
  );

  const pushRoute = useCallback((type, payload) => {
    if (typeof window === "undefined") return;
    const path =
      type === "listen"
        ? `/radio-garden/listen/${slugify(payload.name)}/${payload.id}`
        : `/radio-garden/visit/${slugify(payload.city)}/${payload.id}`;
    window.history.pushState({ radioGarden: true }, "", path);
  }, []);

  const playStation = useCallback(
    async (station, options = {}) => {
      const stationPlace = places.find(
        (place) => place.city === station.city && place.country === station.country
      );
      if (stationPlace && stationPlace.id !== activePlace?.id) {
        setActivePlace(stationPlace);
        setActiveTab("explore");
        setDrawerOpen(true);
        setExpandedStations(false);
      }
      setCurrentStation(station);
      setStatus(started || options.forceStart ? "loading" : "ready");
      setDetailsOpen(false);
      pushRoute("listen", station);

      if (!audioRef.current || !(started || options.forceStart)) return;

      try {
        audioRef.current.src = station.url;
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setStatus("playing");
      } catch (error) {
        setStatus("error");
      }
    },
    [activePlace, places, pushRoute, started, volume]
  );

  const selectPlace = useCallback(
    (place, options = {}) => {
      setActivePlace(place);
      setActiveTab("explore");
      setDrawerOpen(options.openDrawer ?? true);
      setExpandedStations(false);
      pushRoute("visit", place);

      if (!currentStation || currentStation.city !== place.city) {
        setCurrentStation(place.stations[0]);
        setStatus(started ? "ready" : "idle");
      }
    },
    [currentStation, pushRoute, started]
  );

  useEffect(() => {
    localStorage.setItem("openair-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveStations() {
      try {
        const baseQueries = [
          { limit: 180, order: "clickcount", reverse: "true" },
          { countrycode: "IN", limit: 90, order: "votes", reverse: "true" },
          { countrycode: "NP", limit: 35, order: "votes", reverse: "true" },
          ...LANGUAGE_PRESETS.map((preset) => ({
            ...preset.api,
            limit: preset.label === "English" ? 70 : 45,
            order: "votes",
            reverse: "true",
          })),
        ];

        const requests = baseQueries.map(async (query) => {
          const params = new URLSearchParams({
            hidebroken: "true",
            is_https: "true",
            hls: "0",
            ...Object.fromEntries(
              Object.entries(query).map(([key, value]) => [key, String(value)])
            ),
          });
          const response = await fetch(`${RADIO_API}/stations/search?${params.toString()}`);
          if (!response.ok) throw new Error("Station directory unavailable");
          return response.json();
        });

        const settled = await Promise.allSettled(requests);
        if (cancelled) return;
        const data = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
        const live = data.map(normalizeStation);
        setStations((current) => dedupeStations([...current, ...live]).slice(0, MAX_LIVE_STATIONS));
      } catch (error) {
        setStatus((value) => (value === "idle" ? "directory-fallback" : value));
      }
    }

    loadLiveStations();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!places.length || activePlace) return;

    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const chunks = path.split("/").filter(Boolean);
    const visitIndex = chunks.indexOf("visit");
    const listenIndex = chunks.indexOf("listen");

    if (visitIndex !== -1 && chunks[visitIndex + 1]) {
      const place = findPlaceByName(chunks[visitIndex + 1]);
      if (place) {
        window.setTimeout(() => selectPlace(place, { openDrawer: true }), 0);
        return;
      }
    }

    if (listenIndex !== -1 && chunks[listenIndex + 1]) {
      const slug = chunks[listenIndex + 1];
      const station = stations.find((candidate) => slugify(candidate.name) === slug);
      if (station) {
        const place = places.find(
          (candidate) => candidate.city === station.city && candidate.country === station.country
        );
        window.setTimeout(() => {
          if (place) setActivePlace(place);
          setCurrentStation(station);
        }, 0);
        return;
      }
    }

    window.setTimeout(() => selectPlace(findPlaceByName("Bardiya") || places[0], { openDrawer: true }), 0);
  }, [activePlace, findPlaceByName, places, selectPlace, stations]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const activeStations = useMemo(() => activePlace?.stations || [], [activePlace]);
  const visibleStations = expandedStations ? activeStations : activeStations.slice(0, 6);
  const currentIndex = activeStations.findIndex((station) => station.id === currentStation?.id);

  const nearbyPlaces = useMemo(() => {
    if (!activePlace) return [];
    return places
      .filter((place) => place.id !== activePlace.id)
      .map((place) => ({ ...place, distance: distanceKm(activePlace, place) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [activePlace, places]);

  const countryPlaces = useMemo(() => {
    if (!activePlace) return [];
    return places
      .filter((place) => place.country === activePlace.country && place.id !== activePlace.id)
      .sort((a, b) => b.stations.length - a.stations.length)
      .slice(0, 8);
  }, [activePlace, places]);

  const popularInCountry = useMemo(() => {
    if (!activePlace) return [];
    return stations
      .filter((station) => station.country === activePlace.country)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 6);
  }, [activePlace, stations]);

  const areaPicks = useMemo(() => {
    if (!activePlace) return [];
    const selected = new Set(activeStations.map((station) => station.id));
    return nearbyPlaces
      .flatMap((place) => place.stations.slice(0, 2))
      .filter((station) => !selected.has(station.id))
      .slice(0, 6);
  }, [activePlace, activeStations, nearbyPlaces]);

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return { placeMatches: [], stationMatches: [] };

    const placeMatches = places
      .filter((place) => `${place.city} ${place.country}`.toLowerCase().includes(term))
      .slice(0, 7);
    const stationMatches = stations
      .filter((station) =>
        `${station.name} ${station.city} ${station.country} ${station.tags}`
          .toLowerCase()
          .includes(term)
      )
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 16);

    return { placeMatches, stationMatches };
  }, [places, query, stations]);

  const regionalStations = useMemo(() => {
    const regionalTerms = LANGUAGE_PRESETS.map((preset) => preset.query);
    return stations
      .filter((station) => {
        const text = `${station.name} ${station.tags} ${station.city} ${station.country}`.toLowerCase();
        return regionalTerms.some((term) => text.includes(term));
      })
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 14);
  }, [stations]);

  const toggleFavorite = useCallback((station) => {
    setFavorites((current) => {
      if (current.some((item) => item.id === station.id)) {
        return current.filter((item) => item.id !== station.id);
      }
      return [station, ...current].slice(0, 60);
    });
  }, []);

  const stopOrResume = async () => {
    if (!audioRef.current || !currentStation) return;
    if (status === "playing") {
      audioRef.current.pause();
      setStatus("paused");
      return;
    }
    setStarted(true);
    await playStation(currentStation, { forceStart: true });
  };

  const playAdjacent = async (direction) => {
    if (!activeStations.length) return;
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + activeStations.length) % activeStations.length;
    await playStation(activeStations[nextIndex], { forceStart: started });
  };

  const rideBalloon = () => {
    const station = stations[Math.floor(Math.random() * stations.length)];
    const place = places.find(
      (candidate) => candidate.city === station.city && candidate.country === station.country
    );
    if (place) setActivePlace(place);
    setActiveTab("browse");
    setDrawerOpen(true);
    playStation(station, { forceStart: started });
  };

  const goToUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPoint);
        const nearest = places
          .map((place) => ({ ...place, distance: distanceKm(userPoint, place) }))
          .sort((a, b) => a.distance - b.distance)[0];
        if (nearest) selectPlace(nearest, { openDrawer: true });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
    );
  };

  const shareCurrent = async () => {
    const label = currentStation?.name || activePlace?.city || "OpenAir Garden";
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: label, url });
      } catch (error) {}
      return;
    }
    await navigator.clipboard?.writeText(url);
  };

  const renderExplore = () => (
    <>
      <div className="rg-drawer-actions">
        <button type="button" aria-label="Share" onClick={shareCurrent}>
          <Share2 size={20} />
        </button>
        {activePlace && (
          <button type="button" aria-label={`Add ${activePlace.city} page to favorites`}>
            <Heart size={20} />
          </button>
        )}
      </div>

      {activePlace && (
        <button
          type="button"
          className="rg-place-banner"
          onClick={() => setDrawerOpen((value) => !value)}
          aria-expanded={drawerOpen}
        >
          <span className="rg-count-badge">{activePlace.stations.length}</span>
          <span className="rg-place-title">
            <strong>{activePlace.city}</strong>
            <small>{activePlace.country}</small>
          </span>
          <span className="rg-local-time">{localTimeFromLng(activePlace.lng)}</span>
        </button>
      )}

      {drawerOpen && activePlace && (
        <div className="rg-drawer-scroll">
          <section className="rg-section">
            <h2>Stations in {activePlace.city}</h2>
            {visibleStations.map((station) => (
              <StationRow
                key={station.id}
                station={station}
                active={station.id === currentStation?.id}
                favorite={favoriteIds.has(station.id)}
                onFavorite={toggleFavorite}
                onClick={() => playStation(station, { forceStart: started })}
              />
            ))}
            {activeStations.length > 6 && (
              <button
                type="button"
                className="rg-more-row"
                onClick={() => setExpandedStations((value) => !value)}
              >
                {expandedStations ? "Show fewer stations" : `View all ${activeStations.length} stations`}
                <ChevronRight size={24} />
              </button>
            )}
          </section>

          <section className="rg-section">
            <h2>Picks from the Area</h2>
            {areaPicks.map((station) => (
              <StationRow
                key={station.id}
                station={station}
                showPlace
                active={station.id === currentStation?.id}
                favorite={favoriteIds.has(station.id)}
                onFavorite={toggleFavorite}
                onClick={() => playStation(station, { forceStart: started })}
              />
            ))}
          </section>

          <section className="rg-section">
            <h2>Popular in {activePlace.country}</h2>
            {popularInCountry.map((station) => (
              <StationRow
                key={station.id}
                station={station}
                showPlace
                active={station.id === currentStation?.id}
                favorite={favoriteIds.has(station.id)}
                onFavorite={toggleFavorite}
                onClick={() => playStation(station, { forceStart: started })}
              />
            ))}
          </section>

          <section className="rg-section">
            <h2>Nearby {activePlace.city}</h2>
            {nearbyPlaces.map((place) => (
              <button key={place.id} type="button" className="rg-place-row" onClick={() => selectPlace(place)}>
                <span>{place.city}</span>
                <small>{place.distance} km</small>
              </button>
            ))}
          </section>

          {countryPlaces.length > 0 && (
            <section className="rg-section">
              <h2>Cities in {activePlace.country}</h2>
              {countryPlaces.map((place) => (
                <button key={place.id} type="button" className="rg-place-row" onClick={() => selectPlace(place)}>
                  <span>
                    <b>{place.stations.length}</b> {place.city}
                  </span>
                  <ChevronRight size={20} />
                </button>
              ))}
            </section>
          )}
        </div>
      )}
    </>
  );

  const renderSearch = () => (
    <>
      <header className="rg-tab-header">
        <h2>Search</h2>
      </header>
      <div className="rg-search-box">
        <Search size={21} />
        <input
          type="search"
          placeholder="Country, City, Station"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
        {query && (
          <button type="button" aria-label="clear search" onClick={() => setQuery("")}>
            <X size={20} />
          </button>
        )}
      </div>

      <div className="rg-language-chips" aria-label="Language filters">
        {LANGUAGE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={query.toLowerCase() === preset.query ? "is-active" : ""}
            onClick={() => setQuery(preset.query)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="rg-drawer-scroll">
        {query ? (
          <section className="rg-section" aria-label="Search results">
            {searchResults.placeMatches.map((place) => (
              <button key={place.id} type="button" className="rg-search-place" onClick={() => selectPlace(place)}>
                <span className="rg-count-badge">{place.stations.length}</span>
                <span>
                  <strong>{place.city}</strong>
                  <small>{place.country}</small>
                </span>
                <ChevronRight size={24} />
              </button>
            ))}
            {searchResults.stationMatches.map((station) => (
              <StationRow
                key={station.id}
                station={station}
                showPlace
                active={station.id === currentStation?.id}
                favorite={favoriteIds.has(station.id)}
                onFavorite={toggleFavorite}
                onClick={() => playStation(station, { forceStart: started })}
              />
            ))}
            {!searchResults.placeMatches.length && !searchResults.stationMatches.length && (
              <div className="rg-empty-state">
                <Search size={32} />
                <strong>No local signal found</strong>
                <span>Try a country, city or station name.</span>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="rg-feature-block">
              <img src={`${ASSET_BASE}/playlist-lines.svg`} alt="" />
              <h2>Popular Across the Globe</h2>
              <h3>An audience favorite for every country</h3>
              {stations
                .slice()
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 10)
                .map((station) => (
                  <StationRow
                    key={station.id}
                    station={station}
                    showPlace
                    active={station.id === currentStation?.id}
                    favorite={favoriteIds.has(station.id)}
                    onFavorite={toggleFavorite}
                    onClick={() => playStation(station, { forceStart: started })}
                  />
                ))}
            </section>
            <section className="rg-section">
              <h2>Regional FM</h2>
              {regionalStations.slice(0, 10).map((station) => (
                <StationRow
                  key={station.id}
                  station={station}
                  showPlace
                  active={station.id === currentStation?.id}
                  favorite={favoriteIds.has(station.id)}
                  onFavorite={toggleFavorite}
                  onClick={() => playStation(station, { forceStart: started })}
                />
              ))}
            </section>
            <section className="rg-section">
              <h2>New to the Garden</h2>
              {stations.slice(-8).map((station) => (
                <StationRow
                  key={station.id}
                  station={station}
                  showPlace
                  active={station.id === currentStation?.id}
                  favorite={favoriteIds.has(station.id)}
                  onFavorite={toggleFavorite}
                  onClick={() => playStation(station, { forceStart: started })}
                />
              ))}
            </section>
          </>
        )}
      </div>
    </>
  );

  const renderFavorites = () => (
    <>
      <header className="rg-tab-header">
        <h2>Favorites</h2>
      </header>
      <div className="rg-drawer-scroll">
        {favorites.length ? (
          <section className="rg-section">
            {favorites.map((station) => (
              <StationRow
                key={station.id}
                station={station}
                showPlace
                active={station.id === currentStation?.id}
                favorite
                onFavorite={toggleFavorite}
                onClick={() => playStation(station, { forceStart: started })}
              />
            ))}
          </section>
        ) : (
          <article className="rg-favorites-empty">
            <Heart size={28} />
            <strong>Favorites</strong>
            <p>Save your favorite stations, locations and playlists.</p>
            <p>You can add a station to your Favorites by tapping on the heart icon.</p>
            <div>
              <Heart size={23} />
              <span />
              <Heart size={23} fill="currentColor" />
            </div>
          </article>
        )}
      </div>
    </>
  );

  const renderBrowse = () => (
    <>
      <header className="rg-tab-header">
        <h2>Browse</h2>
      </header>
      <div className="rg-drawer-scroll">
        <section className="rg-balloon-card">
          <img src={`${ASSET_BASE}/playlist-lines.svg`} alt="" />
          <p>Go to surprise places and listen to local stations. Can you guess where you are?</p>
          <button type="button" onClick={rideBalloon}>
            <Shuffle size={18} />
            Take a Balloon Ride
          </button>
        </section>

        {PLAYLISTS.map((playlist, index) => (
          <section className="rg-playlist-card" key={playlist.id}>
            <div>
              <h2>{playlist.name}</h2>
              <h3>{playlist.curator}</h3>
              {playlist.tag && <span>{playlist.tag}</span>}
              <p>{playlist.copy}</p>
            </div>
            <img src={`${ASSET_BASE}/playlist-lines.svg`} alt="" />
            <button
              type="button"
              onClick={() => {
                const station = stations[(index * 4) % stations.length];
                const place = places.find(
                  (item) => item.city === station.city && item.country === station.country
                );
                if (place) setActivePlace(place);
                playStation(station, { forceStart: started });
              }}
            >
              <span className="rg-count-badge">{playlist.count}</span>
              View playlist
              <ChevronRight size={24} />
            </button>
          </section>
        ))}

        <section className="rg-section">
          <h2>More Playlists</h2>
          {EXTRA_PLAYLISTS.map(([title, copy]) => (
            <button key={title} type="button" className="rg-wide-row" onClick={rideBalloon}>
              <strong>{title}</strong>
              <small>{copy}</small>
            </button>
          ))}
        </section>
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <header className="rg-tab-header">
        <h2>Settings</h2>
      </header>
      <div className="rg-drawer-scroll">
        <section className="rg-app-card">
          <img src={`${ASSET_BASE}/app-signal.svg`} alt="" />
          <div>
            <strong>OpenAir Garden</strong>
            <span>Get the free companion app for your phone.</span>
          </div>
          <button type="button" disabled title="Coming soon">
            <Smartphone size={18} />
            Google Play
          </button>
          <button type="button" disabled title="Coming soon">
            <Smartphone size={18} />
            App Store
          </button>
        </section>

        <section className="rg-section">
          <h2>Information</h2>
          <Link href="/" className="rg-place-row">
            <span>OpenAir Garden</span>
            <ChevronRight size={20} />
          </Link>
          <button type="button" className="rg-place-row" disabled title="Coming soon">
            <span>Submit a Radio Station</span>
            <ChevronRight size={20} />
          </button>
          <Link href="/policypages/contact" className="rg-place-row">
            <span>Contact</span>
            <ChevronRight size={20} />
          </Link>
          <Link href="/policypages/privacy" className="rg-place-row">
            <span>Privacy Policy</span>
            <ChevronRight size={20} />
          </Link>
        </section>

        <section className="rg-section">
          <h2>Customize</h2>
          <button type="button" className="rg-setting-row" disabled title="Coming soon">
            <Languages size={20} />
            <span>Language</span>
            <small>English</small>
          </button>
          <button type="button" className="rg-setting-row" disabled title="Coming soon">
            <Moon size={20} />
            <span>Dark Mode</span>
            <small>On</small>
          </button>
          <button type="button" className="rg-setting-row" onClick={() => setContrast((value) => !value)}>
            <Contrast size={20} />
            <span>Increased Contrast</span>
            <small>{contrast ? "On" : "Off"}</small>
          </button>
          <button type="button" className="rg-setting-row" onClick={() => setZoomLevel((value) => Math.min(4, value + 1))}>
            <Sparkles size={20} />
            <span>Globe Dots Size</span>
            <small>{zoomLevel > 2 ? "Large" : "Normal"}</small>
          </button>
          <button type="button" className="rg-setting-row" disabled title="Coming soon">
            <Globe2 size={20} />
            <span>Globe Quality</span>
            <small>Normal</small>
          </button>
        </section>

        <section className="rg-section">
          <h2>Transfer Favorites</h2>
          <button type="button" className="rg-wide-row" disabled title="Coming soon">
            <strong>Send Favorites</strong>
            <small>Create a transfer code</small>
          </button>
          <button type="button" className="rg-wide-row" disabled title="Coming soon">
            <strong>Receive Favorites</strong>
            <small>Enter a transfer code</small>
          </button>
        </section>
      </div>
    </>
  );

  const renderDrawer = () => {
    if (activeTab === "search") return renderSearch();
    if (activeTab === "favorites") return renderFavorites();
    if (activeTab === "browse") return renderBrowse();
    if (activeTab === "settings") return renderSettings();
    return renderExplore();
  };

  const statusLine =
    status === "playing"
      ? `${currentStation?.city}, ${currentStation?.country}`
      : status === "loading"
        ? "Loading stream"
        : status === "error"
          ? "station is unreachable"
          : currentStation
            ? `${currentStation.city}, ${currentStation.country}`
            : "Choose a station";

  return (
    <main className={`rg-shell ${contrast ? "is-contrast" : ""}`}>
      <GlobeScene
        places={places}
        activePlace={activePlace}
        onSelectPlace={selectPlace}
        locked={locked}
        zoomLevel={zoomLevel}
        userLocation={userLocation}
      />

      <div className="rg-blue-wash" />
      <Link href="/" className="rg-top-brand">
        <Radio size={19} />
        <span>OpenAir Garden</span>
        <b>{stations.length}</b>
      </Link>

      <aside className={`rg-drawer ${drawerOpen ? "is-open" : "is-condensed"}`}>
        {activeTab === "explore" && activePlace && (
          <button
            type="button"
            className="rg-drawer-toggle"
            onClick={() => setDrawerOpen((value) => !value)}
            aria-label={`${drawerOpen ? "Close" : "Open"} ${activePlace.city} ${activePlace.country} drawer`}
          >
            {drawerOpen ? <ArrowLeft size={23} /> : <ChevronRight size={23} />}
          </button>
        )}
        {renderDrawer()}
        <nav className="rg-main-nav" aria-label="Main navigation">
          <IconNavButton active={activeTab === "explore"} label="Explore" icon={Compass} onClick={() => setActiveTab("explore")} />
          <IconNavButton active={activeTab === "favorites"} label="Favorites" icon={Heart} onClick={() => setActiveTab("favorites")} />
          <IconNavButton active={activeTab === "browse"} label="Browse" icon={MapIcon} onClick={() => setActiveTab("browse")} />
          <IconNavButton active={activeTab === "search"} label="Search" icon={Search} onClick={() => setActiveTab("search")} />
          <IconNavButton active={activeTab === "settings"} label="Settings" icon={Menu} onClick={() => setActiveTab("settings")} />
        </nav>
      </aside>

      <section className="rg-player" aria-label={currentStation ? `Now Playing: ${currentStation.name}` : "Now Playing"}>
        <div className="rg-player-head">
          <div>
            <strong>{currentStation?.name || "OpenAir Garden"}</strong>
            <span className={status === "error" ? "is-error" : ""}>{statusLine}</span>
          </div>
          {currentStation && (
            <button
              type="button"
              aria-label={`${favoriteIds.has(currentStation.id) ? "remove" : "add"} ${currentStation.name} to favorites`}
              className={favoriteIds.has(currentStation.id) ? "is-saved" : ""}
              onClick={() => toggleFavorite(currentStation)}
            >
              <Heart size={25} />
            </button>
          )}
        </div>
        <div className="rg-player-controls">
          <button type="button" aria-label="previous" onClick={() => playAdjacent(-1)} disabled={activeStations.length < 2}>
            <SkipBack size={22} />
          </button>
          <button type="button" aria-label={status === "playing" ? "pause" : "play"} onClick={stopOrResume} disabled={!currentStation}>
            {status === "loading" ? (
              <Loader2 size={25} className="rg-spin" />
            ) : status === "playing" ? (
              <span className="rg-pause-icon" />
            ) : (
              <Play size={26} fill="currentColor" />
            )}
          </button>
          <button type="button" aria-label="next" onClick={() => playAdjacent(1)} disabled={activeStations.length < 2}>
            <SkipForward size={22} />
          </button>
          <label className="rg-volume" aria-label="Set Volume">
            <Volume2 size={18} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </label>
          <button type="button" aria-label="show more channel options" onClick={() => setDetailsOpen(true)}>
            <Settings size={21} />
          </button>
        </div>
      </section>

      <nav className="rg-globe-controls" aria-label="Globe Controls">
        <button type="button" aria-label="Balloon Ride Radio" onClick={rideBalloon}>
          <Shuffle size={23} />
        </button>
        <button
          type="button"
          className={userLocation ? "is-active" : ""}
          aria-label={userLocation ? "Refresh your listening location" : "Go to your location"}
          onClick={goToUserLocation}
        >
          <LocateFixed size={23} />
        </button>
        <button type="button" aria-label="Lock station" onClick={() => setLocked((value) => !value)}>
          {locked ? <Lock size={23} /> : <Unlock size={23} />}
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => setZoomLevel((value) => Math.min(4, value + 1))}>
          <Plus size={25} />
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => setZoomLevel((value) => Math.max(0, value - 1))}>
          <Minus size={25} />
        </button>
        <button type="button" aria-label="imagery credits">
          <Navigation size={18} />
        </button>
      </nav>

      {detailsOpen && currentStation && (
        <div className="rg-modal-layer" role="dialog" aria-modal="true" aria-label={`${currentStation.name} options`}>
          <button type="button" className="rg-modal-close" aria-label={`Close ${currentStation.name} Dialog`} onClick={() => setDetailsOpen(false)}>
            <X size={24} />
          </button>
          <div className="rg-modal-card">
            <header>
              <h2>{currentStation.name}</h2>
              <button
                type="button"
                className={favoriteIds.has(currentStation.id) ? "is-saved" : ""}
                onClick={() => toggleFavorite(currentStation)}
              >
                <Heart size={27} />
              </button>
            </header>
            <button type="button" onClick={shareCurrent}>
              <Share2 size={23} />
              Share Station
            </button>
            <a href={currentStation.homepage || currentStation.url} target="_blank" rel="noreferrer">
              <ExternalLink size={23} />
              Visit Website
            </a>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        onCanPlay={() => setStatus((value) => (value === "loading" ? "playing" : value))}
        onPlaying={() => setStatus("playing")}
        onError={() => setStatus("error")}
        onWaiting={() => setStatus("loading")}
      />
    </main>
  );
}
