"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [
  {
    key: "date",
    label: "Date",
    type: "date",
    default: "",
  },
];

const formatDate = (date) =>
  date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const compute = (v) => {
  if (!v.date) {
    return {
      result: "—",
      caption: "Select a date.",
    };
  }

  const date = new Date(v.date);

  if (isNaN(date.getTime())) {
    return {
      result: "Invalid date",
      caption: "Please select a valid date.",
    };
  }

  // ISO Week Calculation
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDay + 3);

  const weekNumber =
    1 + Math.round((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));

  const isoYear = target.getFullYear();

  // Monday of the week
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7));

  // Sunday of the week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date - startOfYear) / (1000 * 60 * 60 * 24)
  );

  // Quarter
  const quarter = Math.floor(date.getMonth() / 3) + 1;

  return {
    result: `Week ${weekNumber}`,
    caption: `ISO Year ${isoYear}`,
    rows: [
      ["Week Start (Mon)", formatDate(weekStart)],
      ["Week End (Sun)", formatDate(weekEnd)],
      ["Day of Week", date.toLocaleDateString(undefined, { weekday: "long" })],
      ["Day of Year", dayOfYear.toLocaleString()],
      ["Month", date.toLocaleDateString(undefined, { month: "long" })],
      ["Quarter", `Q${quarter}`],
      ["Year", date.getFullYear()],
    ],
  };
};

export default function Page() {
  return (
    <CalcTool
      title="Week Number Calculator"
      description="Find the ISO-8601 week number, week range, day of year, quarter, and other calendar details for any date."
      note="ISO weeks begin on Monday, and Week 1 is the week containing the year's first Thursday."
      fields={fields}
      compute={compute}
    />
  );
}