"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Citrus,
  Copy,
  CupSoda,
  Droplet,
  GlassWater,
  Lightbulb,
  Martini,
  Milk,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Sun,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { barGroups, barItems, drinks, occasions, roleMeta, staples, syrupTip } from "../data";

const groupIcons = {
  juices: GlassWater,
  fizz: CupSoda,
  fresh: Citrus,
  fruits: Sparkles,
  syrups: Droplet,
  dairy: Milk,
  extras: Martini,
};

const occasionIcons = {
  summer: Sun,
  party: Martini,
  kids: Sparkles,
};

const labelById = new Map(barItems.map((item) => [item.id, item.label]));

const sweetLevels = [
  { id: "less", label: "Less sweet", factor: 0.6 },
  { id: "as", label: "As written", factor: 1 },
  { id: "more", label: "Sweeter", factor: 1.4 },
];

const tangLevels = [
  { id: "less", label: "Milder", factor: 0.6 },
  { id: "as", label: "As written", factor: 1 },
  { id: "more", label: "Sharper", factor: 1.4 },
];

const presets = [
  {
    label: "Basic Indian kitchen",
    items: ["lemon", "sugar", "black-salt", "roasted-cumin", "mint", "soda", "milk", "curd", "sugar-syrup"],
  },
  {
    label: "Party bar cart",
    items: [
      "soda",
      "lemon-soda",
      "cola",
      "tonic-water",
      "orange-juice",
      "pineapple-juice",
      "cranberry-juice",
      "grenadine",
      "blue-curacao",
      "lemon",
      "mint",
      "sugar-syrup",
    ],
  },
  {
    label: "Fridge fruits & dairy",
    items: [
      "watermelon",
      "banana",
      "strawberry",
      "mango-pulp",
      "milk",
      "curd",
      "sugar",
      "lemon",
      "honey",
      "ice-cream",
    ],
  },
];

const fractionGlyphs = { 0: "", 0.25: "¼", 0.5: "½", 0.75: "¾" };

const unitForms = {
  leaves: ["leaf", "leaves"],
  cubes: ["cube", "cubes"],
  pieces: ["piece", "pieces"],
  slices: ["slice", "slices"],
  cup: ["cup", "cups"],
  scoop: ["scoop", "scoops"],
  stick: ["stick", "sticks"],
};

const formatQty = (value) => {
  const rounded = Math.round(value * 4) / 4;
  const whole = Math.floor(rounded);
  const glyph = fractionGlyphs[Number((rounded - whole).toFixed(2))] ?? "";
  if (whole === 0) return glyph || "0";
  return `${whole}${glyph}`;
};

const formatUnit = (value, unit) => {
  const forms = unitForms[unit];
  if (!forms) return unit;
  return Math.round(value * 4) / 4 <= 1 ? forms[0] : forms[1];
};

const roundMl = (value) => (value < 15 ? Math.round(value) : Math.round(value / 5) * 5);

const formatVolume = (ml) =>
  ml >= 1000 ? `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)} L` : `${Math.round(ml)} ml`;

const balanceLabel = (drink) => {
  if (drink.sweetness - drink.tang >= 1) return "Sweet-forward";
  if (drink.tang - drink.sweetness >= 1) return "Tart-forward";
  return "Balanced";
};

function RatioBar({ parts, total }) {
  const description = parts
    .map((part) => `${part.label} ${Math.round((part.ml / total) * 100)}%`)
    .join(", ");

  return (
    <div>
      <div
        role="img"
        aria-label={`Composition by volume: ${description}`}
        className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
      >
        {parts.map((part) => (
          <span
            key={part.label}
            className="h-full"
            style={{
              width: `${(part.ml / total) * 100}%`,
              minWidth: "6px",
              background: roleMeta[part.role].color,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {parts.map((part) => (
          <span key={part.label} className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: roleMeta[part.role].color }}
            />
            {part.label} · {Math.round((part.ml / total) * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function DrinkCard({ drink, selected, missing, servings, sweetFactor, tangFactor, onAddMissing, onCopy, copied, spotlight }) {
  const factorFor = (role) => (role === "sweet" ? sweetFactor : role === "sour" ? tangFactor : 1);

  const pour = drink.pour.map((part) => ({
    ...part,
    ml: roundMl(part.ml * servings * factorFor(part.role)),
  }));
  const total = pour.reduce((sum, part) => sum + part.ml, 0);
  const adds = (drink.add || []).map((item) => ({
    ...item,
    qty: item.qty * servings * factorFor(item.role),
  }));

  const hasSweet = [...drink.pour, ...(drink.add || [])].some((part) => part.role === "sweet");
  const hasSour = [...drink.pour, ...(drink.add || [])].some((part) => part.role === "sour");

  const tip = !hasSweet
    ? "No sweetener in this one by design. If it drinks too sharp, stir in 10 ml sugar syrup per glass."
    : !hasSour
      ? "Nothing sour here. A 5-10 ml squeeze of lemon per glass lifts it without turning it tart."
      : `Sweetness and tang controls above rewrite the ${
          [...drink.pour, ...(drink.add || [])].filter((part) => part.role === "sweet" || part.role === "sour").length
        } quantities that actually drive the balance.`;

  const missingAddIns = drink.optional.filter((id) => !selected.has(id));
  const haveAddIns = drink.optional.filter((id) => selected.has(id));

  return (
    <article
      className={`rounded-lg border bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] ${
        spotlight ? "border-[var(--primary)]" : "border-[var(--border)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{drink.name}</h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {drink.glass} · {balanceLabel(drink)}
          </p>
        </div>
        <button type="button" onClick={() => onCopy(drink)} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {drink.occasions.map((id) => {
          const OccasionIcon = occasionIcons[id];
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
            >
              <OccasionIcon className="h-3.5 w-3.5" />
              {occasions.find((item) => item.id === id)?.label}
            </span>
          );
        })}
      </div>

      {missing.length > 0 && (
        <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            You still need
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missing.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onAddMissing(id)}
                title="I actually have this — add it"
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--primary)] px-3 py-1 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--background)]"
              >
                {labelById.get(id)}
                <Check className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Pour · {formatVolume(total)}
            {servings > 1 && ` for ${servings} glasses`}
          </p>
        </div>
        <RatioBar parts={pour} total={total} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {pour.map((part) => (
              <tr key={part.label} className="border-b border-[var(--border)] last:border-0">
                <td className="py-1.5 pr-3 text-[var(--muted-foreground)]">{part.label}</td>
                <td className="py-1.5 text-right font-semibold tabular-nums">{part.ml} ml</td>
              </tr>
            ))}
            {adds.map((item) => (
              <tr key={item.label} className="border-b border-[var(--border)] last:border-0">
                <td className="py-1.5 pr-3 text-[var(--muted-foreground)]">{item.label}</td>
                <td className="py-1.5 text-right font-semibold tabular-nums">
                  {formatQty(item.qty)} {formatUnit(item.qty, item.unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{drink.method}</p>

      <div className="mt-4 grid gap-2 text-sm">
        <p className="text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">Garnish:</span> {drink.garnish}
        </p>
        {(haveAddIns.length > 0 || missingAddIns.length > 0) && (
          <p className="text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Optional add-ins:</span>{" "}
            {haveAddIns.length > 0 && (
              <span className="font-semibold text-[var(--foreground)]">
                {haveAddIns.map((id) => labelById.get(id)).join(", ")}
              </span>
            )}
            {haveAddIns.length > 0 && missingAddIns.length > 0 && " · "}
            {missingAddIns.map((id) => labelById.get(id)).join(", ")}
          </p>
        )}
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
        {tip}
      </p>
    </article>
  );
}

export default function ToolHome() {
  const [selected, setSelected] = useState(() => presets[0].items);
  const [query, setQuery] = useState("");
  const [servings, setServings] = useState(1);
  const [sweetLevel, setSweetLevel] = useState("as");
  const [tangLevel, setTangLevel] = useState("as");
  const [activeOccasions, setActiveOccasions] = useState([]);
  const [spotlightId, setSpotlightId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const sweetFactor = sweetLevels.find((level) => level.id === sweetLevel).factor;
  const tangFactor = tangLevels.find((level) => level.id === tangLevel).factor;

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const toggleOccasion = (id) => {
    const next = activeOccasions.includes(id)
      ? activeOccasions.filter((item) => item !== id)
      : [...activeOccasions, id];
    setActiveOccasions(next);
    if (id === "party" && next.includes("party")) setServings(8);
  };

  const { ready, almost } = useMemo(() => {
    const scored = drinks
      .filter((drink) => activeOccasions.every((id) => drink.occasions.includes(id)))
      .map((drink) => ({
        drink,
        missing: drink.need.filter((id) => !selectedSet.has(id)),
        bonus: drink.optional.filter((id) => selectedSet.has(id)).length,
      }));

    const sorter = (a, b) => b.bonus - a.bonus || a.drink.name.localeCompare(b.drink.name);

    return {
      ready: scored.filter((item) => item.missing.length === 0).sort(sorter),
      almost: scored.filter((item) => item.missing.length === 1).sort(sorter),
    };
  }, [selectedSet, activeOccasions]);

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return barItems;
    return barItems.filter((item) => item.label.toLowerCase().includes(term));
  }, [query]);

  const spotlight = useMemo(
    () => ready.find((item) => item.drink.id === spotlightId) || null,
    [ready, spotlightId]
  );

  const randomPick = () => {
    if (ready.length === 0) return;
    const pool = ready.filter((item) => item.drink.id !== spotlightId);
    const source = pool.length > 0 ? pool : ready;
    setSpotlightId(source[Math.floor(Math.random() * source.length)].drink.id);
  };

  const copyDrink = async (drink) => {
    const factorFor = (role) => (role === "sweet" ? sweetFactor : role === "sour" ? tangFactor : 1);
    const pour = drink.pour.map((part) => ({
      ...part,
      ml: roundMl(part.ml * servings * factorFor(part.role)),
    }));
    const total = pour.reduce((sum, part) => sum + part.ml, 0);

    const text = [
      drink.name,
      `${drink.glass} · ${balanceLabel(drink)} · makes ${servings} ${servings === 1 ? "glass" : "glasses"} (${formatVolume(total)} of liquid)`,
      sweetLevel === "as" && tangLevel === "as"
        ? ""
        : `Adjusted: sweetness ${sweetLevels.find((l) => l.id === sweetLevel).label.toLowerCase()}, tang ${tangLevels
            .find((l) => l.id === tangLevel)
            .label.toLowerCase()}`,
      "",
      "Pour:",
      ...pour.map((part) => `  ${part.ml} ml  ${part.label}`),
      ...(drink.add || []).map((item) => {
        const qty = item.qty * servings * factorFor(item.role);
        return `  ${formatQty(qty)} ${formatUnit(qty, item.unit)}  ${item.label}`;
      }),
      "",
      drink.method,
      "",
      `Garnish: ${drink.garnish}`,
      `Optional add-ins: ${drink.optional.map((id) => labelById.get(id)).join(", ")}`,
      "",
      "Mixed with the ALTFTool Mocktail & Drink Mixer",
    ]
      .filter((line) => line !== "")
      .join("\n");

    const success = await safeCopyText(text);
    if (!success) return;
    setCopiedId(drink.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const servingPresets = [1, 2, 4, 8];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CupSoda className="h-4 w-4" />
            Home bar
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Mocktail &amp; Drink Mixer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Tick what is on your shelf and get {drinks.length} alcohol-free drinks you can actually mix, with
            exact millilitres, a ratio bar for every pour, and one-tap scaling from a single glass to a party
            pitcher.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">What have you got?</h2>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>

            <label className="mt-3 block">
              <span className="sr-only">Search your bar</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search an ingredient"
                  className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </span>
            </label>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Start from a preset
              </p>
              <div className="grid gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelected(preset.items)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5">
              {barGroups.map((group) => {
                const items = visibleItems.filter((item) => item.group === group.id);
                if (items.length === 0) return null;
                const GroupIcon = groupIcons[group.id];
                const count = items.filter((item) => selectedSet.has(item.id)).length;
                return (
                  <div key={group.id}>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      <GroupIcon className="h-4 w-4 text-[var(--primary)]" />
                      {group.label}
                      {count > 0 && <span className="text-[var(--primary)]">{count}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => {
                        const active = selectedSet.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggle(item.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                              active
                                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            {active ? <Check className="h-3.5 w-3.5" /> : null}
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {visibleItems.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Nothing on the shelf matches &ldquo;{query}&rdquo;.
                </p>
              )}
            </div>

            <p className="mt-5 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {staples}
            </p>
            <p className="mt-2 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {syrupTip}
            </p>
          </div>

          <div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {occasions.map((occasion) => {
                    const OccasionIcon = occasionIcons[occasion.id];
                    const active = activeOccasions.includes(occasion.id);
                    return (
                      <button
                        key={occasion.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleOccasion(occasion.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                          active
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <OccasionIcon className="h-3.5 w-3.5" />
                        {occasion.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={randomPick}
                  disabled={ready.length === 0}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:opacity-50"
                >
                  <Shuffle className="h-4 w-4" />
                  Mix me something
                </button>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[auto_1fr]">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Servings
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] p-1">
                      <button
                        type="button"
                        aria-label="One serving fewer"
                        onClick={() => setServings((value) => Math.max(1, value - 1))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                        {servings}
                      </span>
                      <button
                        type="button"
                        aria-label="One serving more"
                        onClick={() => setServings((value) => Math.min(24, value + 1))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {servingPresets.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setServings(value)}
                        className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                          servings === value
                            ? "border-[var(--primary)] text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {value === 8 ? "Pitcher x8" : `x${value}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Sweetness
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sweetLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          aria-pressed={sweetLevel === level.id}
                          onClick={() => setSweetLevel(level.id)}
                          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                            sweetLevel === level.id
                              ? "border-[var(--primary)] text-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Tang
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tangLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          aria-pressed={tangLevel === level.id}
                          onClick={() => setTangLevel(level.id)}
                          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                            tangLevel === level.id
                              ? "border-[var(--primary)] text-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm text-[var(--muted-foreground)]" aria-live="polite">
                <span className="text-2xl font-semibold text-[var(--primary)]">{ready.length}</span>{" "}
                {ready.length === 1 ? "drink" : "drinks"} you can mix from{" "}
                <span className="font-semibold text-[var(--foreground)]">{selected.length}</span>{" "}
                {selected.length === 1 ? "item" : "items"} · {almost.length} more are one bottle away.
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Scaling maths: every millilitre and spoon is multiplied by servings, then sweet parts by{" "}
                {sweetFactor.toFixed(1)}x and sour parts by {tangFactor.toFixed(1)}x. Millilitres over 15 are
                rounded to the nearest 5 so they stay pourable.
              </p>
            </div>

            {spotlight && (
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  <Sparkles className="h-4 w-4" />
                  Tonight&rsquo;s pour
                </p>
                <DrinkCard
                  drink={spotlight.drink}
                  selected={selectedSet}
                  missing={spotlight.missing}
                  servings={servings}
                  sweetFactor={sweetFactor}
                  tangFactor={tangFactor}
                  onAddMissing={toggle}
                  onCopy={copyDrink}
                  copied={copiedId === spotlight.drink.id}
                  spotlight
                />
              </div>
            )}

            {selected.length === 0 ? (
              <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[var(--anslation-ds-shadow-sm)]">
                <CupSoda className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Tick a few bottles on the left to see what you can mix.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <GlassWater className="h-5 w-5 text-[var(--primary)]" />
                    Mix it now
                    <span className="text-sm font-normal text-[var(--muted-foreground)]">({ready.length})</span>
                  </h2>
                  {ready.length === 0 ? (
                    <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)] shadow-[var(--anslation-ds-shadow-sm)]">
                      Nothing is a full match yet. Lemon, sugar syrup, mint and club soda unlock the most
                      drinks in this list — or drop an occasion filter and look at the one-bottle-away shelf.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-4 xl:grid-cols-2">
                      {ready.map((item) => (
                        <DrinkCard
                          key={item.drink.id}
                          drink={item.drink}
                          selected={selectedSet}
                          missing={item.missing}
                          servings={servings}
                          sweetFactor={sweetFactor}
                          tangFactor={tangFactor}
                          onAddMissing={toggle}
                          onCopy={copyDrink}
                          copied={copiedId === item.drink.id}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {almost.length > 0 && (
                  <div className="mt-8">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <Plus className="h-5 w-5 text-[var(--primary)]" />
                      One bottle away
                      <span className="text-sm font-normal text-[var(--muted-foreground)]">
                        ({almost.length})
                      </span>
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Pick up the missing item — or tap it if it is already on your shelf.
                    </p>
                    <div className="mt-3 grid gap-4 xl:grid-cols-2">
                      {almost.map((item) => (
                        <DrinkCard
                          key={item.drink.id}
                          drink={item.drink}
                          selected={selectedSet}
                          missing={item.missing}
                          servings={servings}
                          sweetFactor={sweetFactor}
                          tangFactor={tangFactor}
                          onAddMissing={toggle}
                          onCopy={copyDrink}
                          copied={copiedId === item.drink.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
