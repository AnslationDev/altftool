"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Banknote,
  Briefcase,
  CircleAlert,
  Copy,
  Gem,
  HandHeart,
  Info,
  Moon,
  RotateCcw,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const ZAKAT_RATE = 0.025;
const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;

const assetSections = [
  {
    id: "cash",
    icon: Banknote,
    title: "Cash & bank",
    hint: "Everything you can spend today — notes at home, current and savings balances, wallets, fixed deposits.",
    fields: [
      { id: "cashInHand", label: "Cash in hand", initial: 20000 },
      { id: "bankBalance", label: "Bank current & savings", initial: 180000 },
      { id: "savingsDeposits", label: "Fixed & recurring deposits", initial: 100000 },
    ],
  },
  {
    id: "business",
    icon: Briefcase,
    title: "Business assets",
    hint: "Stock held for resale at its current selling value, plus money customers owe you that you expect to collect.",
    fields: [
      { id: "inventory", label: "Trading stock / inventory", initial: 0 },
      { id: "receivables", label: "Receivables you expect to recover", initial: 0 },
    ],
  },
  {
    id: "investments",
    icon: TrendingUp,
    title: "Investments",
    hint: "Shares, mutual funds and similar holdings at today's market value.",
    fields: [
      { id: "shares", label: "Shares & mutual funds (market value)", initial: 150000 },
      { id: "otherInvestments", label: "Other investments", initial: 0 },
    ],
  },
  {
    id: "other",
    icon: Wallet,
    title: "Other zakatable wealth",
    hint: "Money lent to others that you expect back, committee/chit payouts due to you, rental income held, and anything else you own outright as wealth.",
    fields: [{ id: "otherAssets", label: "Other assets", initial: 0 }],
  },
];

const liabilityFields = [
  { id: "immediateDebts", label: "Immediate debts you owe", initial: 0 },
  { id: "dueBills", label: "Bills due now (rent, utilities, fees)", initial: 15000 },
  { id: "shortTermLoans", label: "Short-term loans & card dues", initial: 0 },
];

const initialValues = () => {
  const values = {};
  assetSections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = field.initial;
    });
  });
  liabilityFields.forEach((field) => {
    values[field.id] = field.initial;
  });
  return values;
};

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const formatGrams = (value) => `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)} g`;

const toAmount = (value) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function AmountInput({ label, value, onChange, prefix = "₹" }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
          {prefix}
        </span>
        <input
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-8 pr-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
      </span>
    </label>
  );
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export default function ToolHome() {
  const [values, setValues] = useState(initialValues);
  const [goldGrams, setGoldGrams] = useState(40);
  const [goldRate, setGoldRate] = useState(9500);
  const [silverGrams, setSilverGrams] = useState(200);
  const [silverRate, setSilverRate] = useState(120);
  const [standard, setStandard] = useState("silver");
  const [copied, setCopied] = useState(false);

  const setValue = (id, next) => setValues((previous) => ({ ...previous, [id]: next }));

  const goldValue = toAmount(goldGrams) * toAmount(goldRate);
  const silverValue = toAmount(silverGrams) * toAmount(silverRate);

  const result = useMemo(() => {
    const lines = [];
    assetSections.forEach((section) => {
      section.fields.forEach((field) => {
        const amount = toAmount(values[field.id]);
        if (amount > 0) lines.push({ group: section.title, label: field.label, amount, kind: "asset" });
      });
    });
    if (goldValue > 0) {
      lines.push({
        group: "Precious metals",
        label: `Gold — ${formatGrams(toAmount(goldGrams))} × ${formatINR(toAmount(goldRate))}/g`,
        amount: goldValue,
        kind: "asset",
      });
    }
    if (silverValue > 0) {
      lines.push({
        group: "Precious metals",
        label: `Silver — ${formatGrams(toAmount(silverGrams))} × ${formatINR(toAmount(silverRate))}/g`,
        amount: silverValue,
        kind: "asset",
      });
    }
    liabilityFields.forEach((field) => {
      const amount = toAmount(values[field.id]);
      if (amount > 0) lines.push({ group: "Liabilities", label: field.label, amount, kind: "liability" });
    });

    const totalAssets = lines
      .filter((line) => line.kind === "asset")
      .reduce((sum, line) => sum + line.amount, 0);
    const totalLiabilities = lines
      .filter((line) => line.kind === "liability")
      .reduce((sum, line) => sum + line.amount, 0);
    const net = totalAssets - totalLiabilities;

    const goldNisab = GOLD_NISAB_GRAMS * toAmount(goldRate);
    const silverNisab = SILVER_NISAB_GRAMS * toAmount(silverRate);
    const activeNisab = standard === "gold" ? goldNisab : silverNisab;
    const meetsNisab = activeNisab > 0 && net >= activeNisab;

    return {
      lines,
      totalAssets,
      totalLiabilities,
      net,
      goldNisab,
      silverNisab,
      activeNisab,
      meetsNisab,
      zakat: meetsNisab ? net * ZAKAT_RATE : 0,
      shortfall: activeNisab - net,
      wouldOweOnGold: goldNisab > 0 && net >= goldNisab,
    };
  }, [values, goldValue, silverValue, goldGrams, goldRate, silverGrams, silverRate, standard]);

  const summary = useMemo(() => {
    const rows = result.lines.map(
      (line) => `  ${line.kind === "liability" ? "-" : "+"} ${line.label}: ${formatINR(line.amount)}`
    );
    return [
      "Zakat Calculator Summary",
      "",
      "Assets & liabilities",
      ...rows,
      "",
      `Total assets: ${formatINR(result.totalAssets)}`,
      `Total liabilities: ${formatINR(result.totalLiabilities)}`,
      `Net zakatable wealth: ${formatINR(result.net)}`,
      "",
      `Nisab standard used: ${standard === "gold" ? "Gold" : "Silver"}`,
      `Gold nisab (${GOLD_NISAB_GRAMS} g × ${formatINR(toAmount(goldRate))}/g): ${formatINR(result.goldNisab)}`,
      `Silver nisab (${SILVER_NISAB_GRAMS} g × ${formatINR(toAmount(silverRate))}/g): ${formatINR(result.silverNisab)}`,
      "",
      result.meetsNisab
        ? `Zakat due (2.5% of net wealth): ${formatINR(result.zakat)}`
        : `Below nisab — no zakat due. You are ${formatINR(Math.max(result.shortfall, 0))} under the threshold.`,
      "",
      "Zakat falls due on wealth held for one full lunar year (hawl).",
      "Rulings differ between schools of thought — please confirm with a scholar you trust.",
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
  }, [result, standard, goldRate, silverRate]);

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const resetAll = () => {
    setValues(initialValues());
    setGoldGrams(40);
    setGoldRate(9500);
    setSilverGrams(200);
    setSilverRate(120);
    setStandard("silver");
  };

  const groupedLines = useMemo(() => {
    const groups = [];
    result.lines.forEach((line) => {
      const existing = groups.find((group) => group.name === line.group);
      if (existing) existing.items.push(line);
      else groups.push({ name: line.group, items: [line] });
    });
    return groups;
  }, [result.lines]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <HandHeart className="h-4 w-4" />
            Annual obligation
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Zakat Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Add up your cash, gold, silver, business stock and investments, subtract what you owe, and check the
            balance against the nisab. If you are above it, zakat is 2.5% of the net.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_420px]">
          <div className="grid gap-6">
            {assetSections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]"
              >
                <div className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="font-semibold">{section.title}</h2>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{section.hint}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <AmountInput
                      key={field.id}
                      label={field.label}
                      value={values[field.id]}
                      onChange={(next) => setValue(field.id, next)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="font-semibold">Gold & silver</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Weigh what you own and enter today&apos;s rate per gram. These rates also set the nisab
                thresholds below, so keep them current.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <AmountInput label="Gold you own (grams)" value={goldGrams} onChange={setGoldGrams} prefix="g" />
                <AmountInput label="Gold rate per gram" value={goldRate} onChange={setGoldRate} />
                <AmountInput
                  label="Silver you own (grams)"
                  value={silverGrams}
                  onChange={setSilverGrams}
                  prefix="g"
                />
                <AmountInput label="Silver rate per gram" value={silverRate} onChange={setSilverRate} />
              </div>
              <div className="tool-compact-grid mt-4">
                <StatTile label="Your gold is worth" value={formatINR(goldValue)} />
                <StatTile label="Your silver is worth" value={formatINR(silverValue)} />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="font-semibold">Liabilities</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Deduct what is genuinely due now. A long home loan is not deducted in full — most scholars only
                allow the instalments falling due within the year.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {liabilityFields.map((field) => (
                  <AmountInput
                    key={field.id}
                    label={field.label}
                    value={values[field.id]}
                    onChange={(next) => setValue(field.id, next)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset all figures
              </button>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your zakat</p>
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>

              <div aria-live="polite" className="mt-4">
                {result.meetsNisab ? (
                  <div className="rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-4xl font-semibold text-[var(--primary)]">{formatINR(result.zakat)}</p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      2.5% of {formatINR(result.net)} net zakatable wealth. Your wealth is above the{" "}
                      {standard} nisab of {formatINR(result.activeNisab)}.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-2xl font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                      Below nisab — no zakat due
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Your net wealth of {formatINR(result.net)} is {formatINR(Math.max(result.shortfall, 0))}{" "}
                      under the {standard} nisab of {formatINR(result.activeNisab)}. Zakat is not owed this
                      year, though voluntary charity (sadaqah) always is welcome.
                    </p>
                  </div>
                )}

                <div className="tool-compact-grid mt-6">
                  <StatTile label="Total assets" value={formatINR(result.totalAssets)} />
                  <StatTile label="Less liabilities" value={`− ${formatINR(result.totalLiabilities)}`} />
                  <StatTile label="Net zakatable wealth" value={formatINR(result.net)} />
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: (assets − liabilities) × 2.5%, charged only when the net clears the nisab.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="font-semibold">Nisab standard</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Nisab is the minimum wealth that makes zakat due. It is fixed in metal, not rupees, so it moves
                with the market rate you entered.
              </p>
              <div className="mt-4 grid gap-2">
                {[
                  {
                    id: "silver",
                    label: "Silver standard",
                    grams: SILVER_NISAB_GRAMS,
                    value: result.silverNisab,
                  },
                  { id: "gold", label: "Gold standard", grams: GOLD_NISAB_GRAMS, value: result.goldNisab },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setStandard(option.id)}
                    className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                      standard === option.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{option.label}</span>
                      <span className="text-xs font-medium">{formatINR(option.value)}</span>
                    </span>
                    <span
                      className={`mt-1 block text-xs font-medium ${
                        standard === option.id ? "" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {option.grams} g at your rate
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  The silver nisab is far lower, so it pulls more people into paying — which is why most scholars
                  recommend it: it favours the poor, who are the recipients. The gold nisab sets a higher bar and
                  is preferred by some, usually for those who own gold.
                  {result.meetsNisab && standard === "silver" && !result.wouldOweOnGold && (
                    <>
                      {" "}
                      On your figures this matters: you owe zakat on the silver standard, but you would fall{" "}
                      <strong className="text-[var(--foreground)]">below</strong> the gold nisab of{" "}
                      {formatINR(result.goldNisab)} and owe nothing.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="font-semibold">The lunar year (hawl)</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Zakat is due on wealth you have held above the nisab for one full lunar year — roughly 354 days,
                about 11 days shorter than the solar year. Your zakat date drifts earlier each Gregorian year
                because of that gap.
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Pick the Hijri date your wealth first crossed the nisab and keep it as your zakat anniversary
                every year. Many people choose a date in Ramadan simply because it is easy to remember. Dips
                during the year do not matter — what counts is that you were above the nisab at the start and at
                the end.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">Full breakdown</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Every line you entered, and how it rolls up to the final figure.
          </p>
          {result.lines.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              Nothing entered yet — add your assets above and the breakdown will build here.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedLines.map((group) => (
                    <Fragment key={group.name}>
                      <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                        <td colSpan={3} className="px-3 py-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                          {group.name}
                        </td>
                      </tr>
                      {group.items.map((line) => (
                        <tr key={line.label} className="border-b border-[var(--border)]">
                          <td className="px-3 py-2">{line.label}</td>
                          <td className="px-3 py-2 text-[var(--muted-foreground)]">
                            {line.kind === "liability" ? "Deducted" : "Zakatable"}
                          </td>
                          <td
                            className="px-3 py-2 text-right font-semibold"
                            style={{
                              color:
                                line.kind === "liability"
                                  ? "var(--anslation-ds-danger)"
                                  : "var(--foreground)",
                            }}
                          >
                            {line.kind === "liability" ? "− " : ""}
                            {formatINR(line.amount)}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                  <tr className="border-b border-[var(--border)]">
                    <td className="px-3 py-2 font-semibold">Net zakatable wealth</td>
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2 text-right font-semibold">{formatINR(result.net)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="px-3 py-2 font-semibold">
                      Nisab threshold ({standard} standard)
                    </td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">
                      {standard === "gold" ? GOLD_NISAB_GRAMS : SILVER_NISAB_GRAMS} g
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">{formatINR(result.activeNisab)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold">
                      {result.meetsNisab ? "Zakat payable at 2.5%" : "Zakat payable"}
                    </td>
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2 text-right text-base font-semibold text-[var(--primary)]">
                      {result.meetsNisab ? formatINR(result.zakat) : "Nil"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="font-semibold">What is usually left out</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Your home, the car you drive, furniture, clothes and tools of your trade are not zakatable — zakat
              falls on wealth that grows, not on things you use. Property bought to resell is stock and counts;
              property let out means only the rent you still hold counts. Personal jewellery is treated
              differently across schools: many count all of it, others exempt what is in regular use.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="font-semibold">Rulings vary — please ask</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              This tool follows the mainstream position: 2.5% on net wealth above the nisab, held for a lunar
              year. The Hanafi, Shafi&apos;i, Maliki and Hanbali schools differ on jewellery, debt deduction,
              pensions and shares, and scholars disagree on which nisab standard binds. Treat the figure here as
              a working estimate and confirm it with a scholar you trust before you pay.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Nothing you type here leaves your device — the whole calculation runs in your browser and nothing is
            saved. Gold and silver rates change daily; update them on your zakat date for an accurate nisab.
          </p>
        </section>
      </div>
    </main>
  );
}
