"use client";

import { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { SectionCard } from "./ui";

const FAQS = [
  { q: "How is age calculated?", a: "Age is calculated based on the difference between your birth date and the current date. It takes into account years, months, days, and adjusts for leap years." },
  { q: "Is my data stored on your servers?", a: "No. All calculations run entirely in your browser — your date of birth never leaves your device and is never stored." },
  { q: "Why is my age different on other websites?", a: "Some sites round months or ignore leap years. We compute the exact calendar difference, so days and months are precise." },
  { q: "Can I calculate age using time of birth?", a: "Yes. Add your time of birth (optional) and the calculator refines the hours, minutes and seconds lived down to the second." },
  { q: "Is this age calculator accurate?", a: "Yes. The engine adjusts for leap years, varying month lengths and the current moment, giving an accurate result down to the second." },
];

export default function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <SectionCard title="Frequently Asked Questions" icon={HelpCircle}>
      <div className="divide-y divide-(--border)">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
              >
                <span className="text-sm font-bold text-(--foreground)">{f.q}</span>
                {isOpen ? <Minus className="h-4 w-4 shrink-0 text-(--primary)" /> : <Plus className="h-4 w-4 shrink-0 text-(--muted-foreground)" />}
              </button>
              {isOpen && <p className="pb-3 text-sm leading-relaxed text-(--muted-foreground)">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
