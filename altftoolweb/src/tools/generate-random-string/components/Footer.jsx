import { Braces, Fingerprint, ShieldCheck } from "lucide-react";

const footerCards = [
  {
    icon: ShieldCheck,
    title: "Secure Randomness",
    description: "Uses browser cryptography to create real random strings without relying on predictable placeholder output.",
  },
  {
    icon: Braces,
    title: "Developer Patterns",
    description: "Build structured strings with length controls, custom character sets, batch output, and pattern-based formats.",
  },
  {
    icon: Fingerprint,
    title: "Local Workflow",
    description: "Copy, export, restore history, and preview QR codes entirely inside your browser session.",
  },
];

export default function Footer() {
  return (
    <footer className="mx-auto mt-8 max-w-6xl text-(--foreground)">
      <div className="grid min-w-0 gap-5 md:grid-cols-3">
        {footerCards.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
    </footer>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="random-string-footer-card animate-fade-up min-w-0 rounded-[28px] border border-(--border) bg-(--card) p-8 text-left shadow-lg transition hover:-translate-y-1 hover:border-cyan-400/70 sm:p-9">
      <Icon className="mb-10 h-8 w-8 text-(--foreground)" strokeWidth={2.2} />
      <h2 className="max-w-52 text-2xl font-black leading-snug text-(--foreground)">{title}</h2>
      <p className="mt-4 max-w-60 text-lg leading-8 text-(--foreground) sm:text-[1.05rem]">{description}</p>
    </article>
  );
}
