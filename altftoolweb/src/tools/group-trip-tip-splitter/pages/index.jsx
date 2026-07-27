"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";

import { CURRENCIES, UNPAID, splitGroupTips } from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PEOPLE = [
  { key: "p1", name: "Alex" },
  { key: "p2", name: "Sam" },
  { key: "p3", name: "Priya" },
];

const DEFAULT_ITEMS = [
  { key: "i1", label: "Dinner — waiter", amount: "24", participantKeys: ["p1", "p2", "p3"], paidByKey: "p1" },
  { key: "i2", label: "Walking tour guide", amount: "30", participantKeys: ["p1", "p2"], paidByKey: "p2" },
  { key: "i3", label: "Porter and housekeeping", amount: "15", participantKeys: ["p1", "p2", "p3"], paidByKey: "" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [people, setPeople] = useState(DEFAULT_PEOPLE);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [nextKey, setNextKey] = useState(4);
  const [currencyCode, setCurrencyCode] = useState("EUR");
  const [copied, setCopied] = useState(false);

  const currency = CURRENCIES.find((item) => item.code === currencyCode) ?? CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const result = useMemo(() => {
    const names = people.map((person, index) => person.name.trim() || `Traveller ${index + 1}`);
    const indexOf = new Map(people.map((person, index) => [person.key, index]));

    const parsed = [];
    for (const item of items) {
      const amount = toNumber(item.amount);
      if (Number.isNaN(amount)) return { error: `"${item.label || "A tip line"}" needs a numeric amount.` };
      parsed.push({
        label: item.label,
        amount,
        participants: item.participantKeys.map((key) => indexOf.get(key)).filter((id) => id !== undefined),
        paidBy: indexOf.has(item.paidByKey) ? indexOf.get(item.paidByKey) : UNPAID,
      });
    }
    return splitGroupTips({ people: names, items: parsed });
  }, [people, items]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Group trip tip split",
      `Total shared tips: ${money(result.total)}`,
      "",
      "Each traveller's share:",
      ...result.perPerson.map(
        (person) =>
          `  ${person.name}: share ${money(person.totalShare)}, paid ${money(person.paid)}, net ${
            person.net >= 0 ? "+" : ""
          }${money(person.net)}`,
      ),
    ];
    if (result.settlements.length > 0) {
      lines.push("", "To settle up:");
      result.settlements.forEach((settlement) => {
        lines.push(`  ${settlement.fromName} pays ${settlement.toName} ${money(settlement.amount)}`);
      });
    } else {
      lines.push("", "Nothing to settle — everyone is square.");
    }
    if (result.potTotal > 0) {
      lines.push("", `Still to collect into the kitty: ${money(result.potTotal)}`);
    }
    return lines.join("\n");
  }, [failed, result, money]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const addPerson = () => {
    const key = `p${nextKey}`;
    setPeople((current) => [...current, { key, name: "" }]);
    setNextKey((value) => value + 1);
  };

  const removePerson = (key) => {
    setPeople((current) => (current.length > 2 ? current.filter((person) => person.key !== key) : current));
    setItems((current) =>
      current.map((item) => ({
        ...item,
        participantKeys: item.participantKeys.filter((id) => id !== key),
        paidByKey: item.paidByKey === key ? "" : item.paidByKey,
      })),
    );
  };

  const renamePerson = (key, name) => {
    setPeople((current) => current.map((person) => (person.key === key ? { ...person, name } : person)));
  };

  const addItem = () => {
    const key = `i${nextKey}`;
    setItems((current) => [
      ...current,
      { key, label: "", amount: "0", participantKeys: people.map((person) => person.key), paidByKey: "" },
    ]);
    setNextKey((value) => value + 1);
  };

  const removeItem = (key) => {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.key !== key) : current));
  };

  const updateItem = (key, patch) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const toggleParticipant = (itemKey, personKey) => {
    setItems((current) =>
      current.map((item) => {
        if (item.key !== itemKey) return item;
        const present = item.participantKeys.includes(personKey);
        return {
          ...item,
          participantKeys: present
            ? item.participantKeys.filter((id) => id !== personKey)
            : [...item.participantKeys, personKey],
        };
      }),
    );
  };

  const reset = () => {
    setPeople(DEFAULT_PEOPLE);
    setItems(DEFAULT_ITEMS);
    setNextKey(4);
    setCurrencyCode("EUR");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Group travel
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Group Trip Tip Splitter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits each shared tip only between the people who were actually there, nets off who paid,
          and reduces the whole mess to the fewest transfers that settles it. Every cent is accounted
          for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Travellers</h2>
          <div className="w-full sm:w-56">
            <label className="sr-only" htmlFor="split-currency">
              Currency
            </label>
            <select
              id="split-currency"
              className={INPUT_CLASS}
              value={currencyCode}
              onChange={(event) => setCurrencyCode(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {people.map((person, index) => (
            <div key={person.key} className="flex items-end gap-2">
              <div className="flex-1">
                <label className={LABEL_CLASS} htmlFor={`person-${person.key}`}>
                  Traveller {index + 1}
                </label>
                <input
                  id={`person-${person.key}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={person.name}
                  placeholder={`Traveller ${index + 1}`}
                  onChange={(event) => renamePerson(person.key, event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removePerson(person.key)}
                disabled={people.length <= 2}
                aria-label={`Remove traveller ${index + 1}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addPerson} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add traveller
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Shared tips</h2>
        <div className="mt-4 grid gap-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Tip {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  disabled={items.length === 1}
                  aria-label={`Remove tip ${index + 1}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`label-${item.key}`}>
                    What was it for
                  </label>
                  <input
                    id={`label-${item.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.label}
                    placeholder={`Tip ${index + 1}`}
                    onChange={(event) => updateItem(item.key, { label: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`amount-${item.key}`}>
                    Tip amount ({currency.code})
                  </label>
                  <input
                    id={`amount-${item.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={item.amount}
                    onChange={(event) => updateItem(item.key, { amount: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`paid-${item.key}`}>
                    Who paid it
                  </label>
                  <select
                    id={`paid-${item.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={item.paidByKey}
                    onChange={(event) => updateItem(item.key, { paidByKey: event.target.value })}
                  >
                    <option value="">Nobody yet — collect into a kitty</option>
                    {people.map((person, personIndex) => (
                      <option key={person.key} value={person.key}>
                        {person.name.trim() || `Traveller ${personIndex + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-semibold text-[var(--foreground)]">Who was there</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {people.map((person, personIndex) => {
                    const checked = item.participantKeys.includes(person.key);
                    return (
                      <label
                        key={person.key}
                        htmlFor={`att-${item.key}-${person.key}`}
                        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                          checked
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        <input
                          id={`att-${item.key}-${person.key}`}
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--primary)]"
                          checked={checked}
                          onChange={() => toggleParticipant(item.key, person.key)}
                        />
                        {person.name.trim() || `Traveller ${personIndex + 1}`}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          ))}
        </div>

        <button type="button" onClick={addItem} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a shared tip
        </button>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total shared tips
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the split."
                : `${result.settlements.length} transfer${result.settlements.length === 1 ? "" : "s"} settles the group`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the tip split and settlement"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy split"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total tips shared", failed ? DASH : money(result.total)],
            ["If it were split evenly", failed ? DASH : money(result.equalSplit)],
            ["Still to collect into a kitty", failed ? DASH : money(result.potTotal)],
            ["Every cent accounted for", failed ? DASH : result.sharesMatchTotal && result.balanced ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Settle up</h2>
            {result.settlements.length === 0 ? (
              <p className="mt-3 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
                Nobody owes anybody — the group is already square.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {result.settlements.map((settlement) => (
                  <li
                    key={`${settlement.from}-${settlement.to}-${settlement.amount}`}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] px-3 py-3 text-sm"
                  >
                    <span className="font-semibold">{settlement.fromName}</span>
                    <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                    <span className="font-semibold">{settlement.toName}</span>
                    <span className="ml-auto font-semibold text-[var(--primary)]">{money(settlement.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Per traveller</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Traveller</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Tips joined</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Their share</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Already paid</th>
                    <th scope="col" className="py-2 text-right font-semibold">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perPerson.map((person) => (
                    <tr key={person.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{person.name}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{person.attended}</td>
                      <td className="py-2 pr-3 text-right">{money(person.totalShare)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(person.paid)}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          person.net > 0
                            ? "text-[var(--success)]"
                            : person.net < 0
                              ? "text-[var(--danger)]"
                              : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {person.net > 0 ? "+" : ""}
                        {money(person.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              A positive net means the group owes that person; a negative net means they owe the
              group. The nets always add up to zero.
            </p>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing is sent anywhere — the split is worked out in your browser. Shares are calculated in
        whole cents, so the individual amounts always add back up to the exact total.
      </p>
    </main>
  );
}
