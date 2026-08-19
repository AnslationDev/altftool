import Link from "next/link";

// Server-rendered copy for a single prank page. Both components are plain
// presentational markup (no hooks, no browser APIs) so a page can render them
// on the server and hand the result to the interactive client shell.
//
// Colours follow the Pranx section's own dark surface (bg-slate-950) rather
// than the global light/dark tokens: these pages force a dark canvas in both
// themes, so semantic foreground tokens would fail contrast on light mode.
// slate-300 on slate-950 clears WCAG AA comfortably.

export function PrankIntro({ prank, content }) {
  if (!prank || !content) return null;

  return (
    <section className="border-b border-white/10 bg-slate-950 px-4 py-5 text-white sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-200">
          Pranx · {prank.category}
        </p>
        <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{prank.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{content.answer}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
          <Link
            href="#how-it-works"
            className="text-indigo-200 underline underline-offset-4 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/40"
          >
            How it works
          </Link>
          <Link
            href="/pranx"
            className="text-indigo-200 underline underline-offset-4 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/40"
          >
            All pranks
          </Link>
        </p>
      </div>
    </section>
  );
}

export function PrankExplainer({ prank, content, className = "" }) {
  if (!prank || !content) return null;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className={`mx-auto w-full max-w-5xl px-4 py-10 text-white sm:px-6 ${className}`}
    >
      <h2 id="how-it-works-heading" className="text-xl font-black sm:text-2xl">
        How does {prank.title} work?
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{content.about}</p>

      <h3 className="mt-7 text-lg font-black">How to use {prank.title}</h3>
      <ol className="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-300 marker:font-black marker:text-indigo-200 sm:text-base">
        {content.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <h3 className="mt-7 text-lg font-black">What it does not do</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{content.limits}</p>
    </section>
  );
}

export default PrankExplainer;
