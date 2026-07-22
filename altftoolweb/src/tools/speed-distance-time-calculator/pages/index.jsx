"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "distance",
    label: "Distance (km)",
    type: "number",
    default: "150",
  },
  {
    key: "time",
    label: "Time (hours)",
    type: "number",
    default: "2",
  },
];

const format = (n, digits = 2) =>
  Number(n).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const formatPace = (minutes) => {
  const mins = Math.floor(minutes);
  let secs = Math.round((minutes - mins) * 60);

  let m = mins;
  if (secs === 60) {
    secs = 0;
    m++;
  }

  return `${m}:${String(secs).padStart(2, "0")}`;
};

const compute = (v) => {
  const distance = Number(v.distance);
  const hours = Number(v.time);

  if (
    !Number.isFinite(distance) ||
    !Number.isFinite(hours) ||
    distance <= 0 ||
    hours <= 0
  ) {
    return {
      result: "—",
      caption: "Enter valid positive values.",
    };
  }

  const kmh = distance / hours;
  const mph = kmh * 0.621371;
  const ms = kmh / 3.6;
  const paceKm = (hours * 60) / distance;
  const paceMile = paceKm * 1.609344;

  return {
    result: `${format(kmh)} km/h`,
    caption: "Average Speed",

    rows: [
      ["Kilometres per Hour", `${format(kmh)} km/h`],
      ["Miles per Hour", `${format(mph)} mph`],
      ["Metres per Second", `${format(ms)} m/s`],
      ["Minutes per km", `${formatPace(paceKm)} /km`],
      ["Minutes per mile", `${formatPace(paceMile)} /mile`],
      ["Distance", `${format(distance)} km`],
      ["Time", `${format(hours)} hours`],
      ["Average Time per 100 km", `${format((hours / distance) * 100)} hours`],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Speed Distance Time Calculator"
      description="Calculate average speed and convert it into km/h, mph, m/s, and running pace from a known distance and travel time."
      note="Formula used: Speed = Distance ÷ Time."
      fields={fields}
      compute={compute}
    />
  );
}