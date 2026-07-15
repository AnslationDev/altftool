import { Paintbrush } from "lucide-react";

export default function Header() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[var(--muted)] text-[var(--primary)] text-xs font-semibold uppercase tracking-wide">
        <Paintbrush className="h-4 w-4" />
        Image Transformation
      </div>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
        <Paintbrush className="h-8 w-8 text-[var(--primary)]" />
      </div>
      <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Cartoon Yourself</h1>
      <p className="mt-3 max-w-2xl mx-auto text-base text-[var(--muted-foreground)] leading-relaxed">
        Transform your photos into cartoon-style portraits with multiple art styles and customization options
      </p>
    </div>
  );
}
