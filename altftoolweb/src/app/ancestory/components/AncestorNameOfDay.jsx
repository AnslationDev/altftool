'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOriginLabel, getVariations, getMeaning } from "../utils/nameGenerator.jsx";
import { DAILY_FIRST_NAMES, DAILY_SURNAMES } from "../utils/constants.jsx";

function buildPreviewVariations(name, type) {
  const n = String(name || "").trim();
  if (!n) return [];

  // Keep variants readable and conservative for preview cards.
  if (type === "Surname") {
    if (n.endsWith("son")) return [n, n.replace(/son$/, "sen"), n.replace(/son$/, "sson")];
    if (n.endsWith("ton")) return [n, n.replace(/ton$/, "town"), n.replace(/ton$/, "ten")];
    return [n, `${n}s`, `${n}-Lee`];
  }

  if (n.endsWith("a")) return [n, `${n}h`, `${n}ia`];
  if (n.endsWith("e")) return [n, n.slice(0, -1), `${n}n`];
  if (n.endsWith("y")) return [n, n.slice(0, -1) + "ie", n.slice(0, -1) + "ey"];
  return [n, `${n}a`, `${n}an`];
}

function buildPreviewData(name, type) {
  const origin = type === "Surname" ? "English / British" : "British / English";
  const meaning =
    type === "Surname"
      ? "Traditional family name with historical usage in English-speaking regions."
      : "Traditional given name with long-standing usage in English-speaking regions.";

  return {
    nationality: { country: [{ country_id: "US", probability: 0.6 }] },
    gender: { name, gender: null, probability: 0 },
    age: { name, age: null, count: 0 },
    nameInfo: {
      name,
      meaning,
      origin,
      variations: buildPreviewVariations(name, type),
      etymology: null,
      description: "This preview is generated locally for homepage name cards.",
      sources: [],
      isLiveData: false,
    },
  };
}

function AncestorNameOfDayCard({ type, name, data, routeType }) {
  const origin = getOriginLabel(name, data);
  const meaning = getMeaning(name, data);
  const vars = getVariations(name, data).slice(0, 3);
  const varsText = vars.length > 1 ? vars.join(", ") : "No common variants listed";

  const href = type === "Surname"
    ? `/ancestory/meaning?type=last&last=${encodeURIComponent(name)}`
    : `/ancestory/meaning?type=first&first=${encodeURIComponent(name)}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col h-full hover:shadow-md transition-shadow dark:bg-(--muted) dark:border-(--border)">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 dark:text-(--muted-foreground)">{type} of the Day</p>
      <h3 className="text-4xl font-bold text-gray-900 mb-5 dark:text-(--foreground)" style={{ fontFamily: "Georgia, serif" }}>{name}</h3>

      <div className="flex flex-col gap-2 mb-5 text-sm">
        <div className="flex gap-2"><span className="text-gray-500 w-20 flex-shrink-0 dark:text-(--muted-foreground)">Origin</span><span className="text-gray-800 font-medium dark:text-(--foreground)">{origin}</span></div>
        <div className="flex gap-2"><span className="text-gray-500 w-20 flex-shrink-0 dark:text-(--muted-foreground)">Meaning</span><span className="text-gray-800 font-medium dark:text-(--foreground)">{meaning}</span></div>
        <div className="flex gap-2"><span className="text-gray-500 w-20 flex-shrink-0 dark:text-(--muted-foreground)">Variations</span><span className="text-[#005831] font-medium">{varsText}</span></div>
      </div>

      <div className="flex-grow" />
      <Link href={href}>
        <button className="mt-4 w-max bg-[#005831] hover:bg-[#004526] dark:bg-gradient-to-r dark:from-emerald-700 dark:to-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors shadow-sm dark:shadow-emerald-900/20">Learn More</button>
      </Link>
    </div>
  );
}

export function AncestorNameOfDay() {
  const [firstNameData, setFirstNameData] = useState(null);
  const [surnameData, setSurnameData] = useState(null);
  const [names, setNames] = useState({ firstName: "Elias", surname: "Miller" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    let stored = { date: "", firstName: "", surname: "" };
    try { stored = JSON.parse(localStorage.getItem("name_of_day") || "{}"); } catch { }

    let firstName = stored.firstName;
    let surname = stored.surname;

    if (stored.date !== today || !firstName || !surname) {
      firstName = DAILY_FIRST_NAMES[Math.floor(Math.random() * DAILY_FIRST_NAMES.length)];
      surname = DAILY_SURNAMES[Math.floor(Math.random() * DAILY_SURNAMES.length)];
      localStorage.setItem("name_of_day", JSON.stringify({ date: today, firstName, surname }));
    }

    setNames({ firstName, surname });
    setFirstNameData(buildPreviewData(firstName, "First Name"));
    setSurnameData(buildPreviewData(surname, "Surname"));
    setLoading(false);
  }, []);

  return (
    <section className="bg-white border-b border-gray-100 py-16 dark:bg-(--background) dark:border-(--border)">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading || !firstNameData || !surnameData ? (
            <>
              <div className="h-64 rounded-xl bg-gray-100 animate-pulse dark:bg-(--muted)" />
              <div className="h-64 rounded-xl bg-gray-100 animate-pulse dark:bg-(--muted)" />
            </>
          ) : (
            <>
              <AncestorNameOfDayCard type="First Name" routeType="first" name={names.firstName} data={firstNameData} />
              <AncestorNameOfDayCard type="Surname" routeType="last" name={names.surname} data={surnameData} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
