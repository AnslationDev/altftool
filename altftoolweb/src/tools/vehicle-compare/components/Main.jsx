"use client";
import React, { useState, useCallback } from "react";
// import FAQSection from "./src/components/FAQs";

/* -------------------------------------------------
   Helper Functions (converted to JS)
-------------------------------------------------- */

const VEHICLE_LIST = [
  {
    id: 1,
    name: "Hyundai Creta (2024)",
    query: "Hyundai Creta 2024 latest ex-showroom price and mileage",
  },
  {
    id: 2,
    name: "Kia Seltos (2024)",
    query: "Kia Seltos 2024 latest ex-showroom price and features",
  },
  {
    id: 3,
    name: "Maruti Brezza (2024)",
    query: "Maruti Brezza 2024 specs and safety rating",
  },
  {
    id: 4,
    name: "Mahindra Scorpio-N (2024)",
    query: "Mahindra Scorpio-N 2024 specs and price",
  },
  {
    id: 5,
    name: "Tata Nexon (2024)",
    query: "Tata Nexon 2024 features and price",
  },
  {
    id: 6,
    name: "Toyota Innova Hycross",
    query: "Toyota Innova Hycross hybrid mileage and power",
  },
];

const formatPrice = (price) => {
  const num = parseFloat(price);
  if (isNaN(num)) return "-";

  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Crore";
  if (num >= 100000) return (num / 100000).toFixed(2) + " Lakh";

  return "₹" + num.toLocaleString("en-IN");
};

const getNumericValue = (val) => {
  if (typeof val !== "string") return 0;
  const match = val.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

const determineWinner = (specName, val1, val2) => {
  const num1 = getNumericValue(val1);
  const num2 = getNumericValue(val2);
  if (num1 === num2) return 0;

  if (specName.includes("Price")) return num1 < num2 ? 1 : 2;
  if (
    specName.includes("Mileage") ||
    specName.includes("Power") ||
    specName.includes("Safety")
  )
    return num1 > num2 ? 1 : 2;

  return 0;
};

/* -------------------------------------------------
   VisualBar Component
-------------------------------------------------- */

const VisualBar = ({ label, v1, v2, higherIsBetter }) => {
  const num1 = getNumericValue(v1);
  const num2 = getNumericValue(v2);
  const maxVal = Math.max(num1, num2);

  if (!maxVal) return null;

  const width1 = (num1 / maxVal) * 100;
  const width2 = (num2 / maxVal) * 100;

  let color1 = higherIsBetter
    ? num1 >= num2
      ? "rgb(59 130 246)"
      : "rgba(239 68 68,0.5)"
    : num1 <= num2
      ? "rgb(34 197 94)"
      : "rgba(239 68 68,0.5)";

  let color2 = higherIsBetter
    ? num2 >= num1
      ? "rgb(59 130 246)"
      : "rgba(239 68 68,0.5)"
    : num2 <= num1
      ? "rgb(34 197 94)"
      : "rgba(239 68 68,0.5)";

  const displayV1 = label.includes("Price") ? formatPrice(v1) : v1;
  const displayV2 = label.includes("Price") ? formatPrice(v2) : v2;

  return (
    <div className="mb-6">
      <p className="font-medium text-(--foreground) mb-2">{label}</p>

      <div className="flex h-8 rounded-lg overflow-hidden bg-(--muted) shadow-inner">
        <div
          className="flex items-center justify-center text-(--foreground) text-xs font-bold transition-all duration-700"
          style={{ width: `${width1}%`, backgroundColor: color1 }}
        >
          {width1 > 20 && displayV1}
        </div>

        <div
          className="flex items-center justify-center text-(--foreground) text-xs font-bold transition-all duration-700"
          style={{ width: `${width2}%`, backgroundColor: color2 }}
        >
          {width2 > 20 && displayV2}
        </div>
      </div>

      <div className="flex justify-between mt-2 text-(--muted-foreground) text-xs">
        <span className="px-2 py-1 bg-(--background) rounded-md">
          {width1 <= 20 ? displayV1 : ""}
        </span>
        <span className="px-2 py-1 bg-(--background) rounded-md">
          {width2 <= 20 ? displayV2 : ""}
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------
   ComparisonResult Component
-------------------------------------------------- */

const ComparisonResult = ({ vehicle1, vehicle2, loading }) => {
  if (loading)
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-t-(--primary) mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-(--foreground)">
          Fetching real-time data…
        </h2>
      </div>
    );

  if (!vehicle1 || !vehicle2) return null;

  const specs = [
    { label: "Price (Ex-Showroom)", key: "price" },
    { label: "Mileage (ARAI)", key: "mileage" },
    { label: "Maximum Power", key: "maxPower" },
    { label: "Safety Rating", key: "safetyRating" },
  ];

  return (
    <div className="space-y-8">
      {/* Visual Comparison */}
      <div className="p-6 rounded-2xl bg-(--card) border border-(--border)">
        <h2 className="text-lg font-bold text-(--primary) mb-4">
          Quick Performance Visualizer
        </h2>

        <VisualBar
          label="Price (INR)"
          v1={vehicle1.data.price}
          v2={vehicle2.data.price}
          higherIsBetter={false}
        />
        <VisualBar
          label="Power (HP/BHP)"
          v1={vehicle1.data.maxPower}
          v2={vehicle2.data.maxPower}
          higherIsBetter={true}
        />
        <VisualBar
          label="Mileage (kmpl)"
          v1={vehicle1.data.mileage}
          v2={vehicle2.data.mileage}
          higherIsBetter={true}
        />
      </div>

      {/* Grid Comparison */}
      <div className="rounded-2xl overflow-hidden bg-(--card) border border-(--border)">
        <div className="grid grid-cols-3 bg-(--muted) text-(--foreground) font-bold text-sm border-b border-(--border)">
          <div className="p-3">Specification</div>
          <div className="p-3">{vehicle1.name}</div>
          <div className="p-3">{vehicle2.name}</div>
        </div>

        {specs.map((spec, i) => {
          const v1 = vehicle1.data[spec.key];
          const v2 = vehicle2.data[spec.key];
          const winner = determineWinner(spec.label, v1, v2);

          return (
            <div
              key={spec.key}
              className={`grid grid-cols-3 text-sm ${
                i % 2 === 0 ? "bg-(--background)" : "bg-(--muted)"
              }`}
            >
              <div className="p-3 text-(--foreground)">{spec.label}</div>

              <div
                className={`p-3 ${winner === 1 ? "text-(--primary) font-bold" : "text-(--foreground)"}`}
              >
                {spec.label.includes("Price") ? formatPrice(v1) : v1}
              </div>

              <div
                className={`p-3 ${winner === 2 ? "text-(--primary) font-bold" : "text-(--foreground)"}`}
              >
                {spec.label.includes("Price") ? formatPrice(v2) : v2}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------- */

const VehicleCompare = () => {
  const [vehicle1Id, setVehicle1Id] = useState(null);
  const [vehicle2Id, setVehicle2Id] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const v1Info = VEHICLE_LIST.find((v) => v.id === vehicle1Id);
  const v2Info = VEHICLE_LIST.find((v) => v.id === vehicle2Id);

  const startCompare = useCallback(() => {
    if (!v1Info || !v2Info) return;

    setLoading(true);

    setTimeout(() => {
      setData({
        v1: {
          price: "1200000",
          mileage: "21.0 kmpl",
          maxPower: "160 HP",
          safetyRating: "5 Stars",
        },
        v2: {
          price: "1500000",
          mileage: "18.5 kmpl",
          maxPower: "180 HP",
          safetyRating: "5 Stars",
        },
      });
      setLoading(false);
    }, 1300);
  }, [v1Info, v2Info]);

  const reset = () => {
    setVehicle1Id(null);
    setVehicle2Id(null);
    setData(null);
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading text-center mb-4">Vehicle Comparison Tool</h1>

        <p className="text-center description mb-8">
          Select any two vehicles to compare real-time specs.
        </p>

        {/* Selectors */}
        <div className="bg-(--card) border border-(--border) rounded-lg p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Vehicle 1 */}
            <div>
              <label className="text-sm text-(--foreground)">
                Select Vehicle 1
              </label>
              <select
                className="w-full p-3 rounded-md bg-(--background) border border-(--border) cursor-pointer"
                value={vehicle1Id || ""}
                onChange={(e) => {
                  setVehicle1Id(Number(e.target.value));
                  setData(null);
                }}
              >
                <option value="">Choose</option>
                {VEHICLE_LIST.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                    disabled={v.id === vehicle2Id}
                  >
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-(--muted-foreground)">VS</div>

            {/* Vehicle 2 */}
            <div>
              <label className="text-sm text-(--foreground)">
                Select Vehicle 2
              </label>
              <select
                className="w-full p-3 rounded-md bg-(--background) border border-(--border) cursor-pointer"
                value={vehicle2Id || ""}
                onChange={(e) => {
                  setVehicle2Id(Number(e.target.value));
                  setData(null);
                }}
              >
                <option value="">Choose</option>
                {VEHICLE_LIST.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                    disabled={v.id === vehicle1Id}
                  >
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            {(vehicle1Id || vehicle2Id) && (
              <button
                onClick={reset}
                className="px-6 py-3 rounded-lg bg-red-600 text-white cursor-pointer"
              >
                Reset
              </button>
            )}

            <button
              onClick={startCompare}
              disabled={!v1Info || !v2Info}
              className={`px-6 py-3 rounded-lg  cursor-pointer ${
                v1Info && v2Info
                  ? "bg-(--primary) text-(--primary-foreground)"
                  : "bg-(--muted)"
              }`}
            >
              {loading ? "Loading..." : "Compare"}
            </button>
          </div>
        </div>

        {/* Results */}
        {data || loading ? (
          <ComparisonResult
            vehicle1={data ? { name: v1Info.name, data: data.v1 } : null}
            vehicle2={data ? { name: v2Info.name, data: data.v2 } : null}
            loading={loading}
          />
        ) : (
          <div className="bg-(--card) border border-(--border) p-10 rounded-lg text-center text-(--muted-foreground)">
            Select vehicles and click Compare.
          </div>
        )}

        {/* <FAQSection /> */}
      </div>
    </div>
  );
};

export default VehicleCompare;
