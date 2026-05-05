"use client";
import React, { useState } from "react";
import HoroscopeHeader from "../components/HoroscopeHeader";
import ZodiacGrid from "../components/ZodiacGrid";
import SelectedSignHeader from "../components/SelectedSignHeader";
import TimeframeButtons from "../components/TimeframeButtons";
import HoroscopeContent from "../components/HoroscopeContent";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import ShareButton from "../components/ShareButton";
import { timeframes } from "../constants/data";
import { proxyFetch } from "../utils/proxyFetch";
import Features from "../components/Features";
// import LuckyDetails from "../components/LuckyDetails";

export default function HoroscopeReader() {
  const [selectedSign, setSelectedSign] = useState(null);
  const [timeframe, setTimeframe] = useState("today");
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHoroscope = async (sign, tf) => {
    setLoading(true);
    setError(null);

    const base = "https://horoscope-app-api.vercel.app/api/v1/get-horoscope";
    const url =
      tf === "today"
        ? `${base}/daily?sign=${sign}&day=today`
        : tf === "week"
          ? `${base}/weekly?sign=${sign}`
          : `${base}/monthly?sign=${sign}`;

    try {
      const data = await proxyFetch(url);
      setHoroscope(data.data);
      console.log("Horoscope data:", data.data);
    } catch {
      setError("Unable to fetch horoscope. Please try again.");
    }

    setLoading(false);
  };

  const handleTimeframe = (tf) => {
    setTimeframe(tf);
    if (selectedSign) fetchHoroscope(selectedSign.name.toLowerCase(), tf);
  };

  const getLabel = () => timeframes.find((t) => t.value === timeframe)?.label;

  const handleShare = () => {
    if (!selectedSign) return;

    const text = `My ${
      selectedSign.name
    } horoscope: ${horoscope?.horoscope_data || ""}`;

    if (navigator.share) {
      navigator.share({ title: "My Horoscope", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <HoroscopeHeader />

        {!selectedSign && <ZodiacGrid onSelect={setSelectedSign} />}

        {selectedSign && (
          <>
            <SelectedSignHeader
              sign={selectedSign}
              onBack={() => {
                setSelectedSign(null);
                setHoroscope(null);
                setError(null);
              }}
            />

            <TimeframeButtons
              selectedSign={selectedSign}
              timeframe={timeframe}
              onSelect={handleTimeframe}
            />

            {loading && <LoadingState />}
            {error && <ErrorState message={error} />}

            {horoscope && !loading && (
              <>
                <HoroscopeContent
                  sign={selectedSign}
                  horoscope={horoscope}
                  timeframeLabel={getLabel()}
                />

                <ShareButton color={selectedSign.color} onClick={handleShare} />
              </>
            )}
          </>
        )}
        <Features/>
      </div>
    </div>
  );
}
