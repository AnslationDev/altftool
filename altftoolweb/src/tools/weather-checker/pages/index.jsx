"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Cloud,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sun,
  CloudRain,
} from "lucide-react";
import Header from "../components/Header";
import Features from "../components/Features";

/* ---------------- WEATHER ICON HELPERS ---------------- */
const weatherCodeToIcon = (code) => {
  if (code === null || code === undefined)
    return <Cloud className="w-16 h-16 text-blue-500" />;
  const c = Number(code);
  if (c === 0) return <Sun className="w-16 h-16 text-yellow-500" />;
  if (c === 1 || c === 2 || c === 3)
    return <Cloud className="w-16 h-16 text-(--muted-foreground)" />;
  if (c >= 45 && c <= 48) return <Cloud className="w-16 h-16 text-gray-300" />;
  if ((c >= 51 && c <= 57) || (c >= 61 && c <= 67))
    return <CloudRain className="w-16 h-16 text-blue-400" />;
  if (c >= 71 && c <= 77)
    return <CloudRain className="w-16 h-16 text-blue-200" />;
  if (c >= 80 && c <= 82)
    return <CloudRain className="w-16 h-16 text-blue-600" />;
  if (c >= 95 && c <= 99)
    return <CloudRain className="w-16 h-16 text-purple-500" />;
  return <Cloud className="w-16 h-16 text-blue-500" />;
};

const weatherCodeToDescription = (code) => {
  if (code === null || code === undefined) return "Unknown";
  const c = Number(code);
  if (c === 0) return "Clear sky";
  if (c === 1) return "Mainly clear";
  if (c === 2) return "Partly cloudy";
  if (c === 3) return "Overcast";
  if (c >= 45 && c <= 48) return "Foggy";
  if (c >= 51 && c <= 53) return "Light drizzle";
  if (c >= 55 && c <= 57) return "Dense drizzle";
  if (c >= 61 && c <= 63) return "Slight rain";
  if (c >= 65 && c <= 67) return "Heavy rain";
  if (c >= 71 && c <= 73) return "Slight snow";
  if (c >= 75 && c <= 77) return "Heavy snow";
  if (c >= 80 && c <= 81) return "Slight rain showers";
  if (c >= 82) return "Violent rain showers";
  if (c >= 95) return "Thunderstorm";
  if (c >= 96) return "Thunderstorm with hail";
  return "Unknown weather";
};

/* Dummy Forecast */
const dummyForecast = [
  { day: "Mon", high: 28, low: 20, code: 0 },
  { day: "Tue", high: 27, low: 19, code: 1 },
  { day: "Wed", high: 26, low: 18, code: 2 },
  { day: "Thu", high: 25, low: 17, code: 3 },
  { day: "Fri", high: 24, low: 16, code: 51 },
  { day: "Sat", high: 27, low: 19, code: 80 },
  { day: "Sun", high: 29, low: 21, code: 95 },
];

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detected, setDetected] = useState(false);

  /* Auto detect location on start */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            setDetected(true);
            const { latitude, longitude } = pos.coords;
            await fetchWeatherByCoords(latitude, longitude);
          } catch {}
        },
        () => {},
        { maximumAge: 60000, timeout: 8000 },
      );
    }
  }, []);

  /* API Helpers */
  async function getCoordinates(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName,
    )}&count=1&language=en&format=json`;
    const res = await axios.get(url);
    if (!res.data.results || res.data.results.length === 0)
      throw new Error("City not found");
    const { latitude, longitude, name, country } = res.data.results[0];
    return { latitude, longitude, name, country };
  }

  async function getCurrentWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const res = await axios.get(url);
    return res.data.current_weather;
  }

  async function fetchWeatherByCoords(lat, lon) {
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const current = await getCurrentWeather(lat, lon);
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`;
      const geoRes = await axios.get(geoUrl).catch(() => null);
      const place = geoRes?.data?.results?.[0];
      setWeather({
        ...current,
        city: place?.name || "Unknown",
        country: place?.country || "",
      });
    } catch {
      setError("Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }

  const searchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const geo = await getCoordinates(city.trim());
      const current = await getCurrentWeather(geo.latitude, geo.longitude);
      setWeather({ ...current, city: geo.name, country: geo.country });
      setDetected(false);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setError("");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          setDetected(true);
        } catch {
          setError("Could not fetch location weather");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Permission denied or location unavailable");
        setLoading(false);
      },
      { timeout: 8000 },
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4">
      <Header />
      {/* Search Card */}

      <div className="rounded-xl border border-(--border) bg-(--card) shadow-lg p-6">
        <form
          onSubmit={searchWeather}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          <div className="relative grow">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) w-4 h-4" />

            <input
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`
                w-full pl-10 py-3 rounded-lg
                bg-(--muted)
                text-(--foreground)
                placeholder:text-(--muted-foreground)
                border border-(--border)
                focus-visible:ring-2 focus-visible:ring-(--primary)
                outline-none
              `}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              py-3 px-6 rounded-lg font-medium
              bg-(--primary) text-white
              hover:opacity-90 transition
            `}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleUseMyLocation}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-dashed border-(--border) text-(--foreground) hover:bg-(--muted)"
          >
            Use my location
          </button>
        </div>

        {detected && (
          <div className="mt-3 text-center text-sm text-green-600">
            Auto-detected your location
          </div>
        )}

        {error && (
          <div className="mt-3 text-center text-sm text-red-500">{error}</div>
        )}
      </div>

      {/* Loading */}
      {loading && !weather && (
        <div className="rounded-xl border border-(--border) bg-(--card) shadow-lg p-6">
          <div className="animate-pulse space-y-4 flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-(--muted)"></div>
            <div className="h-6 w-48 rounded bg-(--muted)"></div>
            <div className="h-8 w-32 rounded bg-(--muted)"></div>
          </div>
        </div>
      )}

      {/* Current Weather */}
      {weather && (
        <div className="rounded-xl border border-(--border) bg-(--card) shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                {weatherCodeToIcon(weather.weathercode)}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-(--foreground)">
                  {weather.city}
                  {weather.country && `, ${weather.country}`}
                </h2>
                <p className="text-(--muted-foreground)">
                  {weatherCodeToDescription(weather.weathercode)}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-(--foreground)">
                {Math.round(weather.temperature)}°C
              </div>
              <div className="text-(--muted-foreground)">Feels like</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-(--muted-foreground)" />
                <div>
                  <div className="font-medium text-(--foreground)">
                    {weather.windspeed} km/h
                  </div>
                  <div className="text-xs text-(--muted-foreground)">Wind</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-(--muted-foreground)" />
                <div>
                  <div className="font-medium text-(--foreground)">65%</div>
                  <div className="text-xs text-(--muted-foreground)">
                    Humidity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast */}
      <div className="rounded-xl border border-(--border) bg-(--card) shadow-lg p-6">
        <h3 className="text-xl font-semibold text-(--foreground) mb-4">
          7-Day Forecast
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
          {dummyForecast.map((day, idx) => (
            <div
              key={idx}
              className={`"
                flex flex-col items-center p-4 rounded-lg
                bg-(--muted) hover:bg-(--muted)/80 transition
              `}
            >
              <div className="font-medium text-(--foreground)">{day.day}</div>
              <div className="my-2">{weatherCodeToIcon(day.code)}</div>
              <div className="flex gap-1 text-sm">
                <span className="font-medium text-(--foreground)">
                  {day.high}°
                </span>
                <span className="text-(--muted-foreground)">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-(--border) bg-(--card) p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-(--muted)">
              <Thermometer className="w-6 h-6 text-(--primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-(--foreground)">
                Temperature Tracking
              </h3>
              <p className="text-sm text-(--muted-foreground)">
                Monitor current and forecasted temperatures
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-(--muted)">
              <Eye className="w-6 h-6 text-(--primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-(--foreground)">
                Visibility Data
              </h3>
              <p className="text-sm text-(--muted-foreground)">
                Check visibility for travel
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      {/* <div className="rounded-xl border border-(--border) bg-(--card) p-4"> */}
      {/* <FAQSection /> */}
      {/* </div> */}

      <div className="text-center text-sm text-(--muted-foreground) pt-4">
        Data provided by Open-Meteo API
      </div>
      <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
      <Features/>
      </div>

    </div>
  );
}
