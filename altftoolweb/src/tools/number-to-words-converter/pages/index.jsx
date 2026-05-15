"use client";

import { useMemo, useState } from "react";
import { Copy, FileText } from "lucide-react";

const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function belowThousand(num) {
  let value = Number(num);
  const words = [];
  if (value >= 100) {
    words.push(`${ones[Math.floor(value / 100)]} hundred`);
    value %= 100;
  }
  if (value >= 20) {
    words.push(`${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ""}`);
  } else if (value > 0) {
    words.push(ones[value]);
  }
  return words.join(" ");
}

function toIndianWords(input) {
  let num = Math.floor(Math.abs(Number(input) || 0));
  if (num === 0) return "zero";
  const parts = [];
  const crore = Math.floor(num / 10000000);
  if (crore) {
    parts.push(`${belowThousand(crore)} crore`);
    num %= 10000000;
  }
  const lakh = Math.floor(num / 100000);
  if (lakh) {
    parts.push(`${belowThousand(lakh)} lakh`);
    num %= 100000;
  }
  const thousand = Math.floor(num / 1000);
  if (thousand) {
    parts.push(`${belowThousand(thousand)} thousand`);
    num %= 1000;
  }
  if (num) parts.push(belowThousand(num));
  return parts.join(" ");
}

function toInternationalWords(input) {
  let num = Math.floor(Math.abs(Number(input) || 0));
  if (num === 0) return "zero";
  const units = [
    ["billion", 1000000000],
    ["million", 1000000],
    ["thousand", 1000],
  ];
  const parts = [];
  units.forEach(([label, size]) => {
    const chunk = Math.floor(num / size);
    if (chunk) {
      parts.push(`${belowThousand(chunk)} ${label}`);
      num %= size;
    }
  });
  if (num) parts.push(belowThousand(num));
  return parts.join(" ");
}

export default function ToolHome() {
  const [number, setNumber] = useState(1234567);
  const [system, setSystem] = useState("indian");
  const [copied, setCopied] = useState(false);

  const words = useMemo(() => {
    const text = system === "indian" ? toIndianWords(number) : toInternationalWords(number);
    return `${Number(number) < 0 ? "minus " : ""}${text}`;
  }, [number, system]);

  const chequeWords = `Rupees ${words} only`;

  const copyText = async () => {
    await navigator.clipboard?.writeText(chequeWords);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <FileText className="h-4 w-4" />
            Document utility
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Number to Words Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert numbers into readable words for invoices, cheques, receipts, and official documents.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Number</span>
              <input
                type="number"
                value={number}
                onChange={(event) => setNumber(Number(event.target.value))}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                ["indian", "Indian"],
                ["international", "International"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSystem(value)}
                  className={`h-11 rounded-md border text-sm font-semibold ${
                    system === value
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Words</p>
            <p className="mt-3 text-2xl font-semibold capitalize leading-snug text-[var(--foreground)]">{words}</p>
            <div className="mt-6 rounded-lg bg-[var(--muted)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Cheque format</p>
              <p className="mt-2 capitalize text-[var(--foreground)]">{chequeWords}</p>
            </div>
            <button
              type="button"
              onClick={copyText}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy words"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
