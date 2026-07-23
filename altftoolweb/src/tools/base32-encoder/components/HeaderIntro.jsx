import { Code2, Lock, ShieldCheck, Zap } from "lucide-react";

const CHIPS = [
  { icon: ShieldCheck, title: "RFC 4648", sub: "Compliant" },
  { icon: Zap, title: "Lightning", sub: "Fast" },
  { icon: Lock, title: "100% Secure", sub: "Encoding" },
  { icon: Code2, title: "Developer", sub: "Friendly" },
];

export default function HeaderIntro() {
  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Base32{" "}
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Encoder
        </span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
        Encode your text or data into Base32 format instantly. Fast, secure and reliable encoding
        for developers and teams.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {CHIPS.map(({ icon: Icon, title, sub }) => (
          <span
            key={title}
            className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-2 pr-4"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon aria-hidden="true" size={15} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-xs font-bold text-foreground">{title}</span>
              <span className="block text-[11px] text-muted-foreground">{sub}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
