import { Globe, Monitor, ShieldCheck, Users } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Authentication Ready",
    description: "Ideal for 2FA secrets and authentication systems",
  },
  {
    icon: Globe,
    title: "DNS & Domains",
    description: "Safe for DNS labels and domain name encoding",
  },
  {
    icon: Users,
    title: "Human Friendly",
    description: "Avoids ambiguous characters like 0, 1, I.l, L, O",
  },
  {
    icon: Monitor,
    title: "System Compatible",
    description: "Works across all major systems and environments",
  },
];

export default function FeatureStrip() {
  return (
    <section aria-label="Why Base32" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon aria-hidden="true" size={19} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
