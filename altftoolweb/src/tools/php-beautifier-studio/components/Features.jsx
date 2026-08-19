import { Code2, Zap, ShieldCheck, Download } from "lucide-react";

export default function Features() {
  return (
    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <FeatureCard
        icon={<Zap className="w-6 h-6 text-indigo-400" />}
        title="Real-time Engine"
        desc="Powered by a real browser-side PHP parser. See the beautified output instantly as you type or adjust settings."
      />
      <FeatureCard
        icon={<Code2 className="w-6 h-6 text-emerald-400" />}
        title="Syntax Safe"
        desc="Our formatting engine guarantees that your PHP logic remains untouched while optimizing structure."
      />
      <FeatureCard
        icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
        title="Error Detection"
        desc="Flags invalid syntax the moment Prettier can't parse it, with the parser's own error message shown alongside the fallback output so you know it needs a second look before you ship it."
      />
      <FeatureCard
        icon={<Download className="w-6 h-6 text-amber-400" />}
        title="Export & Download"
        desc="Copy the formatted PHP to your clipboard or download it as a ready-to-use .php file with a single click."
      />
    </section>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl p-5 border border-(--border) bg-(--card) shadow-xl hover:border-blue-500/20 transition-colors">
      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-(--background) p-3 shadow-sm border border-(--border)">
        {icon}
      </div>
      <h3 className="font-bold text-(--foreground) mb-2">{title}</h3>
      <p className="text-sm text-(--secondary) leading-relaxed">{desc}</p>
    </div>
  );
}
