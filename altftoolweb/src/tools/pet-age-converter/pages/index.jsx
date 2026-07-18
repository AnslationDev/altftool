"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  CalendarDays,
  Cat,
  Copy,
  Dog,
  Heart,
  PawPrint,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DOG_SIZES = [
  { id: "small", label: "Small", detail: "under 10 kg", rate: 4, lifespan: [12, 16] },
  { id: "medium", label: "Medium", detail: "10–25 kg", rate: 5, lifespan: [10, 14] },
  { id: "large", label: "Large", detail: "25–45 kg", rate: 6, lifespan: [9, 12] },
  { id: "giant", label: "Giant", detail: "over 45 kg", rate: 7, lifespan: [7, 10] },
];

const CAT_PROFILE = { rate: 4, lifespan: [12, 18] };

const DOG_STAGES = {
  small: [
    ["Puppy", 0, 1],
    ["Junior", 1, 2],
    ["Adult", 2, 7],
    ["Mature", 7, 10],
    ["Senior", 10, 13],
    ["Geriatric", 13, 17],
  ],
  medium: [
    ["Puppy", 0, 1],
    ["Junior", 1, 2],
    ["Adult", 2, 6],
    ["Mature", 6, 9],
    ["Senior", 9, 12],
    ["Geriatric", 12, 15],
  ],
  large: [
    ["Puppy", 0, 1.25],
    ["Junior", 1.25, 2],
    ["Adult", 2, 5],
    ["Mature", 5, 8],
    ["Senior", 8, 10],
    ["Geriatric", 10, 13],
  ],
  giant: [
    ["Puppy", 0, 1.5],
    ["Junior", 1.5, 2.5],
    ["Adult", 2.5, 5],
    ["Mature", 5, 7],
    ["Senior", 7, 9],
    ["Geriatric", 9, 11],
  ],
};

const CAT_STAGES = [
  ["Kitten", 0, 1],
  ["Junior", 1, 2],
  ["Adult", 2, 7],
  ["Mature", 7, 11],
  ["Senior", 11, 15],
  ["Geriatric", 15, 20],
];

const FUN_FACTS = {
  dog: [
    "The oldest dog on record, Bobi, reached 31 — roughly 140 in small-dog human years.",
    "A dog's nose print is unique, just like a human fingerprint.",
    "Small breeds age slower after year two — that is why their per-year rate is only +4.",
  ],
  cat: [
    "Creme Puff, the oldest cat ever, lived to 38 — about 168 in human years.",
    "Cats sleep 12–16 hours a day, so a 10-year-old cat has been awake for barely 4 of them.",
    "A cat's purr vibrates at 25–150 Hz, a frequency range linked to bone and tissue healing.",
  ],
};

function toHumanYears(age, rate) {
  if (age <= 0) return 0;
  if (age <= 1) return age * 15;
  if (age <= 2) return 15 + (age - 1) * 9;
  return 24 + (age - 2) * rate;
}

function fromHumanYears(human, rate) {
  if (human <= 0) return 0;
  if (human <= 15) return human / 15;
  if (human <= 24) return 1 + (human - 15) / 9;
  return 2 + (human - 24) / rate;
}

function splitAge(age) {
  const safe = Math.max(0, age);
  let years = Math.floor(safe);
  let months = Math.round((safe - years) * 12);
  if (months === 12) {
    years += 1;
    months = 0;
  }
  return { years, months };
}

function formatPetAge(age) {
  const { years, months } = splitAge(age);
  if (years === 0 && months === 0) return "newborn";
  if (years === 0) return `${months} mo`;
  if (months === 0) return `${years} ${years === 1 ? "yr" : "yrs"}`;
  return `${years} ${years === 1 ? "yr" : "yrs"} ${months} mo`;
}

function formatHuman(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function findStage(stages, age) {
  const last = stages[stages.length - 1];
  if (age >= last[1]) return last;
  return stages.find(([, start, end]) => age >= start && age < end) || stages[0];
}

function StageTrack({ stages, age }) {
  const max = stages[stages.length - 1][2];
  const pct = Math.min(100, Math.max(0, (age / max) * 100));
  const current = findStage(stages, age);
  return (
    <div>
      <div className="relative pt-3">
        <div
          className="absolute top-0 h-9 w-1 rounded-full bg-[var(--foreground)]"
          style={{ left: `calc(${pct}% - 2px)` }}
          aria-hidden="true"
        />
        <div className="flex h-3 overflow-hidden rounded-full border border-[var(--border)]">
          {stages.map(([name, start, end], index) => (
            <div
              key={name}
              style={{
                width: `${((end - start) / max) * 100}%`,
                background:
                  name === current[0]
                    ? "var(--primary)"
                    : index % 2
                      ? "var(--muted)"
                      : "var(--anslation-ds-primary-soft)",
              }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {stages.map(([name, start, end]) => (
          <span
            key={name}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              name === current[0]
                ? "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] font-semibold text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--muted-foreground)]"
            }`}
          >
            {name} {start}–{end}y
          </span>
        ))}
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, onChange, unit }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-semibold">
        {label}
        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
          {value} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-[var(--primary)]"
      />
    </label>
  );
}

export default function ToolHome() {
  const [species, setSpecies] = useState("dog");
  const [sizeId, setSizeId] = useState("medium");
  const [direction, setDirection] = useState("petToHuman");
  const [inputMode, setInputMode] = useState("age");
  const [years, setYears] = useState(3);
  const [months, setMonths] = useState(0);
  const [birthday, setBirthday] = useState("");
  const [birthdayNote, setBirthdayNote] = useState("");
  const [humanInput, setHumanInput] = useState("30");
  const [factIndex, setFactIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const size = DOG_SIZES.find((item) => item.id === sizeId) || DOG_SIZES[1];
  const profile = species === "dog" ? size : CAT_PROFILE;
  const stages = species === "dog" ? DOG_STAGES[sizeId] : CAT_STAGES;
  const speciesLabel = species === "dog" ? `${size.label.toLowerCase()} dog` : "cat";

  const petAge = useMemo(() => {
    if (direction === "humanToPet") {
      return fromHumanYears(Math.max(0, Number(humanInput) || 0), profile.rate);
    }
    return Math.max(0, years + months / 12);
  }, [direction, humanInput, months, profile.rate, years]);

  const humanAge = useMemo(() => toHumanYears(petAge, profile.rate), [petAge, profile.rate]);
  const stage = findStage(stages, petAge);
  const [lifeLo, lifeHi] = profile.lifespan;
  const lifeMid = (lifeLo + lifeHi) / 2;
  const lifePct = Math.min(100, Math.round((petAge / lifeMid) * 100));

  const formulaLine =
    species === "dog"
      ? `Formula: year 1 = 15 human yrs · year 2 = +9 · then +${profile.rate}/yr for a ${size.label.toLowerCase()} breed (months interpolated)`
      : "Formula: year 1 = 15 human yrs · year 2 = +9 · then +4/yr (months interpolated)";

  const report = useMemo(() => {
    const lines = [
      "Pet Age Report — ALTFTool",
      `Pet: ${species === "dog" ? `Dog (${size.label.toLowerCase()}, ${size.detail})` : "Cat"}`,
    ];
    if (direction === "humanToPet") {
      lines.push(
        `Human age entered: ${formatHuman(Math.max(0, Number(humanInput) || 0))} human years`,
        `Equivalent ${species} age: ${formatPetAge(petAge)}`
      );
    } else {
      lines.push(`Age: ${formatPetAge(petAge)}`, `Human equivalent: about ${formatHuman(humanAge)} human years`);
    }
    lines.push(
      `Life stage: ${stage[0]} (${stage[1]}–${stage[2]} yrs)`,
      `Typical lifespan: ${lifeLo}–${lifeHi} yrs · ${lifePct}% of a typical ${formatHuman(lifeMid)}-yr span`,
      formulaLine
    );
    return lines.join("\n");
  }, [direction, formulaLine, humanAge, humanInput, lifeHi, lifeLo, lifeMid, lifePct, petAge, size, species, stage]);

  const onBirthdayChange = (value) => {
    setBirthday(value);
    setBirthdayNote("");
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return;
    const born = new Date(y, m - 1, d);
    const now = new Date();
    let totalMonths = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
    if (now.getDate() < born.getDate()) totalMonths -= 1;
    if (totalMonths < 0) {
      setYears(0);
      setMonths(0);
      setBirthdayNote("That birthday is in the future — using age 0.");
      return;
    }
    const cappedMonths = Math.min(totalMonths, 30 * 12);
    if (cappedMonths !== totalMonths) setBirthdayNote("Age capped at 30 years for the calculation.");
    setYears(Math.floor(cappedMonths / 12));
    setMonths(cappedMonths % 12);
  };

  const switchSpecies = (next) => {
    setSpecies(next);
    setFactIndex(0);
  };

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const shareReport = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Pet Age Calculator — ALTFTool", text: report });
        return;
      } catch {
        return;
      }
    }
    copyReport();
  };

  const facts = FUN_FACTS[species];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <PawPrint className="h-4 w-4" />
            Dog &amp; cat years
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Pet Age Calculator (Dog &amp; Cat Years)</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert your pet&apos;s age to human years with the veterinary size-based method — not the old
            &quot;times 7&quot; myth — and see their life stage and lifespan progress at a glance.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div role="group" aria-label="Conversion direction" className="grid grid-cols-2 gap-2">
              {[
                { id: "petToHuman", label: "Pet → Human" },
                { id: "humanToPet", label: "Human → Pet" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDirection(option.id)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                    direction === option.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {option.id === "humanToPet" ? <ArrowRightLeft className="h-4 w-4" /> : null}
                  {option.label}
                </button>
              ))}
            </div>

            <p className="mb-2 mt-5 text-sm font-semibold">Pet</p>
            <div role="group" aria-label="Pet species" className="grid grid-cols-2 gap-2">
              {[
                { id: "dog", label: "Dog", Icon: Dog },
                { id: "cat", label: "Cat", Icon: Cat },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchSpecies(id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                    species === id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {species === "dog" ? (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold">Dog size (adult weight)</p>
                <div role="group" aria-label="Dog size class" className="grid grid-cols-2 gap-2">
                  {DOG_SIZES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSizeId(item.id)}
                      className={`rounded-md border px-3 py-2 text-left transition ${
                        sizeId === item.id
                          ? "border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)]"
                          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className={`block text-sm font-semibold ${sizeId === item.id ? "text-[var(--primary)]" : ""}`}>
                        {item.label}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{item.detail}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {direction === "petToHuman" ? (
              <div className="mt-5">
                <div role="group" aria-label="Age input mode" className="grid grid-cols-2 gap-2">
                  {[
                    { id: "age", label: "Enter age" },
                    { id: "birthday", label: "Pick birthday" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setInputMode(option.id)}
                      className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                        inputMode === option.id
                          ? "border-[var(--primary)] text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {inputMode === "age" ? (
                  <div className="mt-4 grid gap-4">
                    <SliderField label="Years" value={years} min={0} max={30} onChange={setYears} unit="yrs" />
                    <SliderField label="Months" value={months} min={0} max={11} onChange={setMonths} unit="mo" />
                  </div>
                ) : (
                  <label className="mt-4 block">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
                      Pet&apos;s birthday
                    </span>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(event) => onBirthdayChange(event.target.value)}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <span className="mt-2 block text-xs text-[var(--muted-foreground)]">
                      {birthdayNote || (birthday ? `Auto-computed age: ${formatPetAge(years + months / 12)}` : "We compute the age for you.")}
                    </span>
                  </label>
                )}
              </div>
            ) : (
              <label className="mt-5 block">
                <span className="text-sm font-semibold">Your age in human years</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="130"
                  value={humanInput}
                  onChange={(event) => setHumanInput(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-2 block text-xs text-[var(--muted-foreground)]">
                  Example: &quot;I&apos;m 30 in human years — that&apos;s a {formatPetAge(fromHumanYears(30, profile.rate))} old {speciesLabel}.&quot;
                </span>
              </label>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {direction === "petToHuman"
                  ? `Your ${speciesLabel} in human years`
                  : `A ${formatHuman(Math.max(0, Number(humanInput) || 0))}-year-old human as a ${speciesLabel}`}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy result"}
                </button>
                <button type="button" onClick={shareReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            <div aria-live="polite" className="mt-4 flex flex-wrap items-center gap-4">
              <div className="rounded-lg bg-[var(--muted)] p-5">
                {direction === "petToHuman" ? (
                  <>
                    <p className="text-4xl font-semibold text-[var(--primary)]">≈ {formatHuman(humanAge)}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">human years at {formatPetAge(petAge)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-semibold text-[var(--primary)]">≈ {formatPetAge(petAge)}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{species} age equivalent</p>
                  </>
                )}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
                <PawPrint className="h-4 w-4" />
                {stage[0]} · {stage[1]}–{stage[2]} yrs
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{formulaLine}</p>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Life-stage track</p>
              <StageTrack stages={stages} age={petAge} />
            </div>

            <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Heart className="h-4 w-4 text-[var(--primary)]" />
                  Expected lifespan: {lifeLo}–{lifeHi} years
                </p>
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {lifePct}% of a typical {formatHuman(lifeMid)}-yr span
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full" style={{ width: `${lifePct}%`, background: "var(--primary)" }} />
              </div>
              {petAge > lifeHi ? (
                <p className="mt-2 text-xs font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                  Beyond the typical range — an extraordinary senior!
                </p>
              ) : null}
            </div>

            <div className="mt-6 rounded-md bg-[var(--muted)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  <Sparkles className="h-4 w-4" />
                  Fun fact {factIndex + 1}/{facts.length}
                </p>
                <button
                  type="button"
                  onClick={() => setFactIndex((factIndex + 1) % facts.length)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Next fact
                </button>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{facts[factIndex]}</p>
            </div>

            <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
              Estimates follow common veterinary aging guidelines — breeds and individuals vary, so for
              health decisions always talk to your veterinarian.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
