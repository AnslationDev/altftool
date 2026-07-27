"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DIET_TAGS,
  DISH_KINDS,
  MAX_DISHES,
  PRIORITIES,
  buildBucketList,
  formatBucketListText,
  makeDishId,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const STARTER_DISHES = [
  { id: makeDishId(1), name: "Masala dosa", kind: "main", priority: 1, tags: ["gluten"], ticked: false, note: "Breakfast, before 10am" },
  { id: makeDishId(2), name: "Filter coffee", kind: "light", priority: 1, tags: ["dairy"], ticked: false, note: "" },
  { id: makeDishId(3), name: "Chettinad pepper chicken", kind: "main", priority: 1, tags: ["meat", "verySpicy"], ticked: false, note: "" },
  { id: makeDishId(4), name: "Banana leaf thali", kind: "main", priority: 2, tags: ["dairy"], ticked: false, note: "Lunch only" },
  { id: makeDishId(5), name: "Kothu parotta", kind: "main", priority: 2, tags: ["gluten", "egg"], ticked: false, note: "Late evening" },
  { id: makeDishId(6), name: "Jigarthanda", kind: "light", priority: 2, tags: ["dairy", "nuts"], ticked: false, note: "" },
  { id: makeDishId(7), name: "Sundal from a beach cart", kind: "light", priority: 3, tags: [], ticked: false, note: "" },
];

const DEFAULTS = {
  destination: "Chennai",
  days: "4",
  mainMealsPerDay: "2",
  lightSlotsPerDay: "2",
  allowDoubleUp: false,
  avoidTags: [],
};

export default function ToolHome() {
  const [destination, setDestination] = useState(DEFAULTS.destination);
  const [days, setDays] = useState(DEFAULTS.days);
  const [mainMealsPerDay, setMainMealsPerDay] = useState(DEFAULTS.mainMealsPerDay);
  const [lightSlotsPerDay, setLightSlotsPerDay] = useState(DEFAULTS.lightSlotsPerDay);
  const [allowDoubleUp, setAllowDoubleUp] = useState(DEFAULTS.allowDoubleUp);
  const [avoidTags, setAvoidTags] = useState(DEFAULTS.avoidTags);
  const [dishes, setDishes] = useState(STARTER_DISHES);
  const [nextId, setNextId] = useState(STARTER_DISHES.length + 1);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildBucketList({
        days: Number(days),
        mainMealsPerDay: Number(mainMealsPerDay),
        lightSlotsPerDay: Number(lightSlotsPerDay),
        allowDoubleUp,
        avoidTags,
        dishes,
      }),
    [days, mainMealsPerDay, lightSlotsPerDay, allowDoubleUp, avoidTags, dishes],
  );

  const addDish = () => {
    if (dishes.length >= MAX_DISHES) return;
    const id = makeDishId(nextId);
    setNextId((value) => value + 1);
    setDishes((current) => [
      ...current,
      { id, name: "", kind: "main", priority: 2, tags: [], ticked: false, note: "" },
    ]);
  };

  const updateDish = (id, patch) =>
    setDishes((current) => current.map((dish) => (dish.id === id ? { ...dish, ...patch } : dish)));

  const toggleDishTag = (id, tag) =>
    setDishes((current) =>
      current.map((dish) => {
        if (dish.id !== id) return dish;
        const has = dish.tags.includes(tag);
        return { ...dish, tags: has ? dish.tags.filter((item) => item !== tag) : [...dish.tags, tag] };
      }),
    );

  const removeDish = (id) => setDishes((current) => current.filter((dish) => dish.id !== id));

  const toggleAvoid = (tag) =>
    setAvoidTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));

  const copyResult = async () => {
    const text = formatBucketListText(plan, destination);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDestination(DEFAULTS.destination);
    setDays(DEFAULTS.days);
    setMainMealsPerDay(DEFAULTS.mainMealsPerDay);
    setLightSlotsPerDay(DEFAULTS.lightSlotsPerDay);
    setAllowDoubleUp(DEFAULTS.allowDoubleUp);
    setAvoidTags(DEFAULTS.avoidTags);
    setDishes(STARTER_DISHES);
    setNextId(STARTER_DISHES.length + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Must-eat list
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Local Cuisine Bucket List Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A trip has a fixed number of eating slots. Add the dishes you want, mark the ones you would
          regret missing, and see exactly which ones the days can hold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lcb-destination">
              Destination
            </label>
            <input
              id="lcb-destination"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lcb-days">
              Days there
            </label>
            <input
              id="lcb-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lcb-main">
              Main meals per day
            </label>
            <input
              id="lcb-main"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="5"
              step="1"
              value={mainMealsPerDay}
              onChange={(event) => setMainMealsPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lcb-light">
              Snack or sweet stops per day
            </label>
            <input
              id="lcb-light"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="8"
              step="1"
              value={lightSlotsPerDay}
              onChange={(event) => setLightSlotsPerDay(event.target.value)}
            />
          </div>
        </div>

        <label
          htmlFor="lcb-doubleup"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        >
          <input
            id="lcb-doubleup"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={allowDoubleUp}
            onChange={() => setAllowDoubleUp((value) => !value)}
          />
          <span>Allow a full dish in a snack slot (doubling up)</span>
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Filter out dishes containing</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIET_TAGS.map((tag) => (
              <label
                key={tag.id}
                htmlFor={`lcb-avoid-${tag.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold"
              >
                <input
                  id={`lcb-avoid-${tag.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={avoidTags.includes(tag.id)}
                  onChange={() => toggleAvoid(tag.id)}
                />
                <span>{tag.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">The list</h2>
          <button type="button" onClick={addDish} className={GHOST_BTN} aria-label="Add a dish to the list">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add dish
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {dishes.map((dish, index) => (
            <li key={dish.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`lcb-name-${dish.id}`}>
                    Dish {index + 1}
                  </label>
                  <input
                    id={`lcb-name-${dish.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="Dish name"
                    value={dish.name}
                    onChange={(event) => updateDish(dish.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`lcb-kind-${dish.id}`}>
                    Size
                  </label>
                  <select
                    id={`lcb-kind-${dish.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={dish.kind}
                    onChange={(event) => updateDish(dish.id, { kind: event.target.value })}
                  >
                    {DISH_KINDS.map((kind) => (
                      <option key={kind.id} value={kind.id}>
                        {kind.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`lcb-priority-${dish.id}`}>
                    Priority
                  </label>
                  <select
                    id={`lcb-priority-${dish.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={dish.priority}
                    onChange={(event) => updateDish(dish.id, { priority: Number(event.target.value) })}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`lcb-note-${dish.id}`}>
                    Note (where, or when it is served)
                  </label>
                  <input
                    id={`lcb-note-${dish.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={dish.note}
                    onChange={(event) => updateDish(dish.id, { note: event.target.value })}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {DIET_TAGS.map((tag) => {
                  const active = dish.tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleDishTag(dish.id, tag.id)}
                      aria-pressed={active}
                      className={`min-h-11 rounded-full border px-3 text-xs font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        active
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {tag.label.replace("Contains ", "")}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor={`lcb-ticked-${dish.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
                >
                  <input
                    id={`lcb-ticked-${dish.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={dish.ticked}
                    onChange={() => updateDish(dish.id, { ticked: !dish.ticked })}
                  />
                  <span>Eaten</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeDish(dish.id)}
                  aria-label={`Remove ${dish.name || `dish ${index + 1}`}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Dishes ticked off
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : `${plan.ticked.length}/${plan.eligible}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error ? "Fix the input above to build the plan." : plan.verdict.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the must-eat plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the whole list" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!plan.error && (
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${Math.round(plan.progressPct)} percent of the list eaten`}
          >
            <span className="block h-full bg-[var(--success)]" style={{ width: `${plan.progressPct}%` }} />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Eating slots on this trip", plan.error ? DASH : `${plan.totalSlots} (${plan.mainSlots} meals, ${plan.lightSlots} snacks)`],
            ["Still to eat", plan.error ? DASH : plan.pending.length],
            ["Scheduled into a slot", plan.error ? DASH : plan.scheduledCount],
            ["Will not fit", plan.error ? DASH : plan.unscheduled.length],
            ["Slots left free", plan.error ? DASH : plan.freeSlots],
            ["New dishes per day", plan.error ? DASH : (Math.round(plan.pacePerDay * 10) / 10).toString()],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Suggested day-by-day</h2>
          <ol className="mt-4 space-y-4">
            {plan.schedule.map((day) => (
              <li key={day.day}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Day {day.day}</p>
                {day.main.length === 0 && day.light.length === 0 ? (
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Free — eat whatever you find.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {[...day.main, ...day.light].map((dish) => (
                      <li
                        key={dish.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                      >
                        <span className="font-semibold">{dish.name}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {dish.placedAs === "main" ? "meal" : "snack stop"}
                          {dish.note ? ` · ${dish.note}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {!plan.error && (plan.cuts.length > 0 || plan.excluded.length > 0 || plan.notes.length > 0) && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to cut</h2>
          {plan.cuts.length > 0 ? (
            <ol className="mt-3 space-y-2 text-sm">
              {plan.cuts.map((dish) => (
                <li key={dish.id} className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]">
                  <span className="font-semibold">{dish.name}</span> —{" "}
                  {PRIORITIES.find((p) => p.value === dish.priority)?.label.toLowerCase()}, no free{" "}
                  {dish.slot === "main" ? "meal slot" : "snack stop"} left.
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">Nothing needs cutting — the list fits.</p>
          )}

          {plan.excluded.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Filtered out on dietary grounds</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {plan.excluded.map((dish) => (
                  <li
                    key={dish.id}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
                  >
                    {dish.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.notes.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {plan.notes.map((note) => (
                <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning aid, not dietary or medical advice. Tags are only as accurate as you enter them — anyone
        with a food allergy should confirm ingredients directly with the kitchen and carry a written card in
        the local language.
      </p>
    </main>
  );
}
