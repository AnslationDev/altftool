"use client";

import { Container, Button } from "../components/ui";
import { toCatalog, toHome } from "../router";

export function NotFound({ label = "page" }) {
  return (
    <section className="flex min-h-[70vh] items-center pt-28">
      <Container>
        <div className="max-w-xl">
          <div className="display text-[clamp(80px,14vw,180px)] font-light italic leading-none text-ink/15">
            404
          </div>
          <h1 className="display mt-6 text-[clamp(28px,4vw,48px)] font-light leading-[1.05]">
            We couldn't find that {label}.
          </h1>
          <p className="mt-5 text-[15px] leading-[1.7] text-ink-soft">
            It may have been retired. When a ranking hasn't been re-verified in twelve
            months we pull it down rather than leave stale advice online.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={toCatalog()}>Browse the catalog</Button>
            <Button href={toHome()} variant="outline">Back to the homepage</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
