import { ArrowRight, Lock } from "lucide-react";

export default function InfoCard() {
  return (
    <section
      aria-label="About Base32"
      className="flex items-center gap-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm"
    >
      {/* Decorative Base32 tile */}
      <div aria-hidden="true" className="relative hidden shrink-0 sm:block">
        <div className="flex h-32 w-32 -rotate-6 flex-col items-center justify-center rounded-3xl border border-border bg-card shadow-lg">
          <span className="text-sm font-bold italic text-muted-foreground">Base32</span>
          <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-5xl font-extrabold text-transparent">
            32
          </span>
        </div>
        <span className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-md">
          <Lock size={15} />
        </span>
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-bold text-foreground">What is Base32?</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Base32 is a binary-to-text encoding scheme that represents binary data using 32 ASCII
          characters (A–Z and 2–7).
        </p>
        <a
          href="https://datatracker.ietf.org/doc/html/rfc4648"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Learn more <ArrowRight aria-hidden="true" size={14} />
        </a>
      </div>
    </section>
  );
}
