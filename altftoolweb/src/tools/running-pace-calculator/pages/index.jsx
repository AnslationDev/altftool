"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "distance",
    label: "Distance (km)",
    type: "number",
    default: "5",
  },
  {
    key: "time",
    label: "Time (minutes)",
    type: "number",
    default: "30",
  },
];

const formatPace = (minutes) => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);

  const adjustedMins = secs === 60 ? mins + 1 : mins;
  const adjustedSecs = secs === 60 ? 0 : secs;

  return `${adjustedMins}:${String(adjustedSecs).padStart(2, "0")}`;
};

const formatTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.round((minutes - Math.floor(minutes)) * 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${m}:${String(s).padStart(2, "0")}`;
};

const compute = (v) => {
  const distance = Number(v.distance);
  const totalMinutes = Number(v.time);

  if (
    !Number.isFinite(distance) ||
    !Number.isFinite(totalMinutes) ||
    distance <= 0 ||
    totalMinutes <= 0
  ) {
    return {
      result: "—",
      caption: "Enter valid distance and time.",
    };
  }

  const pacePerKm = totalMinutes / distance;
  const pacePerMile = pacePerKm * 1.609344;
  const speed = distance / (totalMinutes / 60);

  const raceDistances = [
    ["5K", 5],
    ["10K", 10],
    ["Half Marathon", 21.0975],
    ["Marathon", 42.195],
  ];

  const rows = [
    ["Average Speed", `${speed.toFixed(2)} km/h`],
    ["Pace per km", `${formatPace(pacePerKm)} /km`],
    ["Pace per mile", `${formatPace(pacePerMile)} /mile`],
  ];

  raceDistances.forEach(([label, km]) => {
    rows.push([
      `${label} Prediction`,
      formatTime(pacePerKm * km),
    ]);
  });

  return {
    result: `${formatPace(pacePerKm)} /km`,
    caption: `Average speed: ${speed.toFixed(2)} km/h`,
    rows,
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Running Pace Calculator"
      description="Calculate your running pace, average speed, and estimated finish times for popular race distances."
      note="Predicted race times assume you maintain the same average pace throughout the run."
      fields={fields}
      compute={compute}
    />
  );
}