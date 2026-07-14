import { Pencil } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center mb-10 pt-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--primary)">
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Image · Creators
      </div>
      <h1 className="section-title tool-heading-accent mt-4">
        Photo to Sketch
      </h1>
      <p className="description mx-auto max-w-2xl mt-2">
        Turn any photo into a hand-drawn pencil sketch right in your browser.
        Adjust the intensity, compare before &amp; after, then download the result.
      </p>
    </header>
  );
}
