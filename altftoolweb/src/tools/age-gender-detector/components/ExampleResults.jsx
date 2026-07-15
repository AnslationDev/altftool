"use client";

import { CARD, CARD_HOVER, SectionHeading } from "./ui.jsx";

/**
 * Illustrated sample results. The portraits are generated SVG artwork
 * (no real photographs), so nothing here involves an actual person.
 */
const EXAMPLES = [
  {
    id: "female-21",
    age: 21,
    gender: "Female",
    confidence: 94,
    skin: "#d9a877",
    hair: "#4a2f1f",
    bg1: "#0d9488",
    bg2: "#155e75",
    longHair: true,
  },
  {
    id: "male-10",
    age: 10,
    gender: "Male",
    confidence: 91,
    skin: "#c9976b",
    hair: "#232323",
    bg1: "#b7791f",
    bg2: "#92400e",
    longHair: false,
  },
  {
    id: "male-56",
    age: 56,
    gender: "Male",
    confidence: 89,
    skin: "#d9a877",
    hair: "#9ca3af",
    bg1: "#334155",
    bg2: "#0f172a",
    longHair: false,
    glasses: true,
  },
  {
    id: "female-33",
    age: 33,
    gender: "Female",
    confidence: 92,
    skin: "#c9976b",
    hair: "#1f2937",
    bg1: "#0e7490",
    bg2: "#164e63",
    longHair: true,
  },
];

function Portrait({ example }) {
  const { skin, hair, bg1, bg2, longHair, glasses, id } = example;
  return (
    <svg
      viewBox="0 0 240 240"
      role="img"
      aria-label={`Illustrated example portrait, ${example.gender.toLowerCase()}, around ${example.age} years old`}
      className="block h-auto w-full"
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg1} />
          <stop offset="1" stopColor={bg2} />
        </linearGradient>
      </defs>
      <rect width="240" height="240" fill={`url(#bg-${id})`} />
      {longHair && <path d="M63 118c0-70 30-96 57-96s57 26 57 96l6 92H57z" fill={hair} />}
      <path d="M120 226c-52 0-72 26-76 44h152c-4-18-24-44-76-44z" fill={bg2} />
      <path d="M120 222c-44 0-66 22-72 48h144c-6-26-28-48-72-48z" fill="#f8fafc" opacity="0.14" />
      <rect x="104" y="164" width="32" height="52" rx="14" fill={skin} />
      <circle cx="120" cy="128" r="52" fill={skin} />
      {!longHair && (
        <path
          d="M68 122c0-38 24-60 52-60s52 22 52 60c0 8-2 16-5 22-2-30-21-46-47-46s-45 16-47 46c-3-6-5-14-5-22z"
          fill={hair}
        />
      )}
      {longHair && (
        <path d="M68 124c0-40 24-62 52-62s52 22 52 62c-6-26-24-42-52-42s-46 16-52 42z" fill={hair} />
      )}
      <circle cx="102" cy="130" r="5" fill="#232323" />
      <circle cx="138" cy="130" r="5" fill="#232323" />
      {glasses && (
        <g stroke="#232323" strokeWidth="3.5" fill="none">
          <circle cx="102" cy="130" r="13" />
          <circle cx="138" cy="130" r="13" />
          <path d="M115 130h10" />
        </g>
      )}
      <path d="M110 154q10 8 20 0" stroke="#232323" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M93 116q9-7 18 0M129 116q9-7 18 0" stroke="#232323" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function ExampleResults() {
  return (
    <section aria-label="Example results">
      <SectionHeading eyebrow="What you'll get" title="Example Results" />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {EXAMPLES.map((example) => (
          <li key={example.id} className={`${CARD} ${CARD_HOVER} flex overflow-hidden`}>
            <div className="w-[45%] shrink-0">
              <Portrait example={example} />
            </div>
            <dl className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3.5">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                  Age
                </dt>
                <dd className="text-xl font-extrabold leading-tight tabular-nums text-(--foreground)">
                  {example.age}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                  Gender
                </dt>
                <dd className="text-sm font-bold text-(--foreground)">{example.gender}</dd>
              </div>
              <div>
                <dt className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                  Confidence
                  <span className="tabular-nums text-(--foreground)">{example.confidence}%</span>
                </dt>
                <dd className="h-1.5 overflow-hidden rounded-full bg-(--muted)">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${example.confidence}%`,
                      background: "var(--anslation-ds-cta-gradient)",
                    }}
                  />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
