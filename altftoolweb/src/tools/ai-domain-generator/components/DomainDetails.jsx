"use client";

const domainMeaningTemplates = [
  "A platform where {name} products are built and launched.",
  "An online service dedicated to {name}.",
  "A hub for {name}-related tools and resources.",
  "A community for everything about {name}.",
  "A place to explore and develop {name}-related ideas.",
];

function generateDomainMeaning(domainName) {
  const name = domainName.split(".")[0].toLowerCase();
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return domainMeaningTemplates[hash % domainMeaningTemplates.length].replace("{name}", name);
}

export function DomainDetailsPanel({ details }) {
  if (!details) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--background) p-5 shadow-sm ">
        <div className="text-sm font-semibold text-(--foreground)">
          Domain Details
        </div>
        <div className="mt-2 text-sm text-(--foreground)/70">
          Select a domain card to see length, keywords, brand score, and similar
          suggestions.
        </div>
      </div>
    );
  }

  const domainMeaning = details.meaning || generateDomainMeaning(details.domain);

  return (
    <div className="rounded-2xl border border-(--border) bg-(--background) p-5 shadow-sm ">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-(--foreground)">
            Domain Details
          </div>
          <div className="mt-1 text-base font-semibold text-(--foreground)">
            {details.domain}
          </div>
        </div>

        <div className="inline-flex rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-xs font-medium text-(--foreground)">
          Length: {details.length}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-(--foreground)/70">
            Keyword breakdown
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {details.keywordBreakdown.map((k) => (
              <div
                key={k}
                className="inline-flex rounded-full border border-(--border) bg-(--background) px-2.5 py-1 text-xs font-medium text-(--foreground)"
              >
                {k}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-(--foreground)/70">
            Brand score
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 w-full rounded-full bg-(--border)">
              <div
                className="h-2 rounded-full bg-(--foreground)"
                style={{ width: `${details.brandScore}%` }}
              />
            </div>
            <div className="w-12 text-right text-sm font-semibold text-(--foreground)">
              {details.brandScore}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-(--foreground)/70">
          Domain Meaning
        </div>
        <div className="mt-2 text-sm text-(--foreground)">{domainMeaning}</div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-(--foreground)/70">
          Similar suggestions
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {details.similar.map((s) => (
            <div
              key={s}
              className="inline-flex rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-xs font-medium text-(--foreground)"
            >
              {s}
            </div>
          ))}
        </div>
        <button
  onClick={() => {
    const domain = details?.domain || "";

    window.open(
      `https://www.namecheap.com/domains/registration/results/?domain=${domain}`,
      "_blank"
    );
  }}
  className="mt-3 inline-flex items-center justify-center rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
>
  Open Registrar
</button>
      </div>
    </div>
  );
}
