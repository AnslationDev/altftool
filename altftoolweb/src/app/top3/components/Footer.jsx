"use client";

import { Container, Logo } from "./ui";
import { categories } from "../data/content";
import { toCatalog, toCategory } from "../router";

export function Footer() {
  const col1 = categories.slice(0, 6);
  const col2 = categories.slice(6, 12);
  const col3 = categories.slice(12, 18);

  return (
    <footer className="relative bg-ink text-paper">
      <Container wide className="py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo dark />
            <p className="mt-5 max-w-xs text-[14px] leading-[1.6] text-paper/70">
              The editorial guide to the three best of everything. Independent since
              2019. Reader-supported since day one.
            </p>
            <div className="mt-8 flex items-center gap-4 text-paper/70">
              {["Twitter", "LinkedIn", "RSS", "Bluesky"].map((s) => (
                <a key={s} href="#" className="link-underline text-[12px]">
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">Categories</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              {col1.map((c) => (
                <li key={c.id}>
                  <a href={toCategory(c.slug)} className="text-paper/80 transition hover:text-accent-soft">{c.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">&nbsp;</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              {col2.map((c) => (
                <li key={c.id}>
                  <a href={toCategory(c.slug)} className="text-paper/80 transition hover:text-accent-soft">{c.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">&nbsp;</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              {col3.map((c) => (
                <li key={c.id}>
                  <a href={toCategory(c.slug)} className="text-paper/80 transition hover:text-accent-soft">{c.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">Publication</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              <li><a href={toCatalog()} className="text-paper/80 transition hover:text-accent-soft">Full catalog</a></li>
              <li><a href="#methodology" className="text-paper/80 transition hover:text-accent-soft">Methodology</a></li>
              <li><a href="#standards" className="text-paper/80 transition hover:text-accent-soft">Editorial standards</a></li>
              <li><a href="#experts" className="text-paper/80 transition hover:text-accent-soft">Masthead</a></li>
              <li><a href="#" className="text-paper/80 transition hover:text-accent-soft">Contact</a></li>
              <li><a href="#" className="text-paper/80 transition hover:text-accent-soft">Ethics</a></li>
            </ul>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="mt-24 overflow-hidden border-t border-paper/15 pt-10">
          <div className="display select-none text-[22vw] font-light italic leading-[0.82] tracking-[-0.04em] text-paper/[0.08]">
            Top3
          </div>
        </div>

        {/* Fine print */}
        <div className="mt-6 flex flex-col gap-4 border-t border-paper/10 pt-6 text-[11px] font-mono uppercase tracking-[0.16em] text-paper/50 md:flex-row md:items-center md:justify-between">
          <div>© 2019–2026 Top3 Editorial · Independent · Reader-supported</div>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="hover:text-paper">Privacy</a>
            <a href="#" className="hover:text-paper">Terms</a>
            <a href="#" className="hover:text-paper">Affiliate disclosure</a>
            <a href="#" className="hover:text-paper">Accessibility</a>
          </div>
          <div>Version 3.4.1 · Built in Brooklyn</div>
        </div>
      </Container>
    </footer>
  );
}
