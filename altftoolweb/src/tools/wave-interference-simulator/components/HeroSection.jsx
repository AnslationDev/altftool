import { WaveIcon } from "./Icons";

export default function HeroSection() {
  return (
    <div className="text-center mb-8 pt-6">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-semibold mb-5">
        <WaveIcon />
        Wave Mechanics Lab
      </div>
      <h1 className="heading tool-heading-accent">
        Wave Interference Simulator
      </h1>
      <p className="description mt-3 text-[var(--muted-foreground)]">
        Explore constructive & destructive interference, standing waves, and ripple patterns in an interactive, cinematic physics laboratory.
      </p>
    </div>
  );
}
