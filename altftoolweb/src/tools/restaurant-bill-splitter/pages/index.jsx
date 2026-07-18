"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Copy, Plus, Receipt, Trash2, UserPlus, X } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const seedPeople = [
  { id: "p1", name: "Aarav" },
  { id: "p2", name: "Diya" },
  { id: "p3", name: "Kabir" },
];

const seedItems = [
  { id: "i1", name: "Paneer Tikka", price: 320, assignedTo: [] },
  { id: "i2", name: "Dal Makhani", price: 280, assignedTo: [] },
  { id: "i3", name: "Butter Naan (4)", price: 240, assignedTo: [] },
  { id: "i4", name: "Cold Coffee", price: 180, assignedTo: ["p2"] },
  { id: "i5", name: "Gulab Jamun", price: 140, assignedTo: ["p1", "p3"] },
];

const makeId = () => Math.random().toString(36).slice(2, 10);

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatINR = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.abs(safe - Math.round(safe)) < 0.005
    ? inrWhole.format(Math.round(safe))
    : inrExact.format(safe);
};

function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-left transition hover:border-[var(--primary)]"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{hint}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function ToolHome() {
  const [people, setPeople] = useState(seedPeople);
  const [items, setItems] = useState(seedItems);
  const [personName, setPersonName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemAssign, setItemAssign] = useState([]);
  const [taxPct, setTaxPct] = useState("5");
  const [tipPct, setTipPct] = useState("10");
  const [evenSplit, setEvenSplit] = useState(false);
  const [copied, setCopied] = useState(false);

  const breakdown = useMemo(() => {
    const taxRate = Math.max(0, Number(taxPct) || 0) / 100;
    const tipRate = Math.max(0, Number(tipPct) || 0) / 100;
    const rows = new Map(
      people.map((person) => [person.id, { person, items: [], subtotal: 0 }])
    );
    let subtotal = 0;
    items.forEach((item) => {
      const price = Math.max(0, Number(item.price) || 0);
      subtotal += price;
      if (!people.length) return;
      const validIds = item.assignedTo.filter((id) => rows.has(id));
      const shareIds =
        evenSplit || validIds.length === 0 ? people.map((person) => person.id) : validIds;
      const share = price / shareIds.length;
      shareIds.forEach((id) => {
        const row = rows.get(id);
        row.items.push({ name: item.name, share, shared: shareIds.length > 1 });
        row.subtotal += share;
      });
    });
    const tax = subtotal * taxRate;
    const tip = subtotal * tipRate;
    const grand = subtotal + tax + tip;
    const persons = [...rows.values()].map((row) => ({
      ...row,
      tax: row.subtotal * taxRate,
      tip: row.subtotal * tipRate,
      total: row.subtotal * (1 + taxRate + tipRate),
    }));
    const personsSum = persons.reduce((acc, row) => acc + row.total, 0);
    return {
      subtotal,
      tax,
      tip,
      grand,
      persons,
      personsSum,
      matches: Math.abs(grand - personsSum) < 0.01,
    };
  }, [evenSplit, items, people, taxPct, tipPct]);

  const summary = useMemo(() => {
    const lines = [
      "Restaurant Bill Split",
      `Subtotal: ${formatINR(breakdown.subtotal)} · GST ${Number(taxPct) || 0}%: ${formatINR(breakdown.tax)} · Tip ${Number(tipPct) || 0}%: ${formatINR(breakdown.tip)}`,
      `Grand total: ${formatINR(breakdown.grand)}`,
      evenSplit ? "Mode: everything split evenly" : "Mode: split by items ordered",
      "",
    ];
    breakdown.persons.forEach((row) => {
      lines.push(
        `${row.person.name}: items ${formatINR(row.subtotal)} + GST ${formatINR(row.tax)} + tip ${formatINR(row.tip)} = ${formatINR(row.total)}`
      );
    });
    if (breakdown.persons.length) {
      lines.push(
        "",
        `Check: ${breakdown.persons.map((row) => formatINR(row.total)).join(" + ")} = ${formatINR(breakdown.personsSum)}`
      );
    }
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [breakdown, evenSplit, taxPct, tipPct]);

  const addPerson = () => {
    const name = personName.trim();
    if (!name) return;
    setPeople((current) => [...current, { id: makeId(), name }]);
    setPersonName("");
  };

  const removePerson = (personId) => {
    setPeople((current) => current.filter((person) => person.id !== personId));
    setItems((current) =>
      current.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((id) => id !== personId),
      }))
    );
    setItemAssign((current) => current.filter((id) => id !== personId));
  };

  const toggleAssign = (personId) => {
    setItemAssign((current) =>
      current.includes(personId)
        ? current.filter((id) => id !== personId)
        : [...current, personId]
    );
  };

  const canAddItem = Number(itemPrice) > 0;

  const addItem = () => {
    if (!canAddItem) return;
    const name = itemName.trim() || `Item ${items.length + 1}`;
    setItems((current) => [
      ...current,
      {
        id: makeId(),
        name,
        price: Number(itemPrice),
        assignedTo: itemAssign.filter((id) => people.some((person) => person.id === id)),
      },
    ]);
    setItemName("");
    setItemPrice("");
    setItemAssign([]);
  };

  const removeItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const assignLabel = (item) => {
    if (evenSplit) return "Even split";
    const names = item.assignedTo
      .map((id) => people.find((person) => person.id === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : "Everyone";
  };

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Receipt className="h-4 w-4" />
            Fair dining split
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Restaurant Bill Splitter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Add everyone at the table, assign dishes to whoever ordered them, and let GST and tip
            be shared in proportion to what each person ate — no more awkward math at the counter.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label htmlFor="rbs-person" className="text-sm font-semibold">
              Add person
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="rbs-person"
                type="text"
                value={personName}
                onChange={(event) => setPersonName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addPerson();
                }}
                placeholder="e.g. Riya"
                className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
              <button
                type="button"
                onClick={addPerson}
                className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
              >
                <UserPlus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {people.map((person) => (
                <span
                  key={person.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-sm font-semibold"
                >
                  {person.name}
                  <button
                    type="button"
                    aria-label={`Remove ${person.name}`}
                    onClick={() => removePerson(person.id)}
                    className="text-[var(--muted-foreground)] transition hover:text-[var(--anslation-ds-danger)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {people.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Add at least one person to start splitting.
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <p className="text-sm font-semibold">Add item</p>
              <div className="mt-2 grid grid-cols-[1fr_110px] gap-2">
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Item name
                  </span>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(event) => setItemName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addItem();
                    }}
                    placeholder="e.g. Biryani"
                    className="mt-1 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Price (₹)
                  </span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={itemPrice}
                    onChange={(event) => setItemPrice(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addItem();
                    }}
                    className="mt-1 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>
              <p className="mt-3 text-xs font-semibold text-[var(--muted-foreground)]">
                Who shares it?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setItemAssign([])}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    itemAssign.length === 0
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  Everyone
                </button>
                {people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => toggleAssign(person.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      itemAssign.includes(person.id)
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {person.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                disabled={!canAddItem}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add item
              </button>

              {items.length > 0 && (
                <ul className="mt-4 grid gap-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">
                          {assignLabel(item)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold">
                          {formatINR(Number(item.price) || 0)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="text-[var(--muted-foreground)] transition hover:text-[var(--anslation-ds-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
              <label className="block">
                <span className="text-sm font-semibold">GST / tax (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  inputMode="decimal"
                  value={taxPct}
                  onChange={(event) => setTaxPct(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Tip / service (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  inputMode="decimal"
                  value={tipPct}
                  onChange={(event) => setTipPct(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="mt-4">
              <Toggle
                checked={evenSplit}
                onChange={setEvenSplit}
                label="Split everything evenly"
                hint="Ignore who ordered what and divide the grand total equally."
              />
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Bill summary
                </p>
                <button
                  type="button"
                  onClick={copySummary}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy split"}
                </button>
              </div>
              <div className="tool-compact-grid mt-4">
                {[
                  ["Subtotal", formatINR(breakdown.subtotal)],
                  [`GST ${Number(taxPct) || 0}%`, formatINR(breakdown.tax)],
                  [`Tip ${Number(tipPct) || 0}%`, formatINR(breakdown.tip)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
                <div className="rounded-md bg-[var(--muted)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Grand total</p>
                  <p className="mt-1 font-semibold text-[var(--primary)]">
                    {formatINR(breakdown.grand)}
                  </p>
                </div>
              </div>
              <div
                className="mt-4 rounded-md bg-[var(--muted)] px-4 py-3 text-sm leading-6"
                aria-live="polite"
              >
                {people.length === 0 ? (
                  <span className="text-[var(--muted-foreground)]">
                    Add people to see who pays what.
                  </span>
                ) : (
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <CircleCheck
                      className={`h-4 w-4 shrink-0 ${
                        breakdown.matches
                          ? "text-[var(--anslation-ds-success)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    />
                    <span>
                      {breakdown.persons.map((row) => formatINR(row.total)).join(" + ")} ={" "}
                      <strong>{formatINR(breakdown.personsSum)}</strong>
                      {breakdown.matches
                        ? " — per-person totals add up to the bill"
                        : ` — off by ${formatINR(Math.abs(breakdown.grand - breakdown.personsSum))} due to rounding`}
                    </span>
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: person total = own items + own items x GST% + own items x tip% · shared
                items are divided equally among the people assigned to them.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Per-person breakdown
              </p>
              {breakdown.persons.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  No one at the table yet — add people on the left.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {breakdown.persons.map((row) => (
                    <div
                      key={row.person.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                    >
                      <p className="font-semibold">{row.person.name}</p>
                      {row.items.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
                          {row.items.map((entry, index) => (
                            <li
                              key={`${row.person.id}-${index}`}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="truncate">
                                {entry.name}
                                {entry.shared ? " (shared)" : ""}
                              </span>
                              <span className="shrink-0">{formatINR(entry.share)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                          No items assigned yet.
                        </p>
                      )}
                      <div className="mt-3 space-y-1 border-t border-[var(--border)] pt-2 text-xs text-[var(--muted-foreground)]">
                        <div className="flex justify-between">
                          <span>Items</span>
                          <span>{formatINR(row.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Share of GST</span>
                          <span>{formatINR(row.tax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Share of tip</span>
                          <span>{formatINR(row.tip)}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between border-t border-[var(--border)] pt-2 text-sm font-semibold">
                        <span>Total</span>
                        <span className="text-[var(--primary)]">{formatINR(row.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
