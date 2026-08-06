import Link from "next/link";
import { COST_LABELS, EFFORT_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "@altftool/core/backlinks";

/**
 * Facets as links rather than form controls.
 *
 * Every filter combination is therefore a real, shareable, crawlable URL, the
 * page works with JavaScript disabled, and there is no client bundle for what
 * is fundamentally navigation. The trade-off is a round trip per filter click,
 * which is the right call for a list people filter two or three times and then
 * start opening tabs from.
 */

function buildHref(base, current, key, value) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    if (v && k !== "page" && k !== key) params.set(k, v);
  }
  // Clicking the active facet clears it, so every filter is its own toggle.
  if (value && current[key] !== value) params.set(key, value);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function Group({ title, base, current, paramKey, options, counts }) {
  const visible = options.filter(([id]) => (counts?.[id] ?? 0) > 0);
  if (visible.length === 0) return null;

  return (
    <div>
      <h3 className="mb-1.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <ul>
        {visible.map(([id, label]) => {
          const active = current[paramKey] === id;
          return (
            <li key={id}>
              <Link
                className="bl-facet"
                href={buildHref(base, current, paramKey, id)}
                aria-current={active ? "true" : undefined}
                scroll={false}
              >
                <span className="truncate">{label}</span>
                <span className="bl-facet__count">{counts[id]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function FilterRail({ base = "/backlinks", current, facets, groups, counts = {} }) {
  const anyActive = ["group", "cost", "status", "priority", "effort", "quickWins", "freeOnly", "q"].some(
    (k) => current[k],
  );

  return (
    <aside className="flex flex-col gap-5" aria-label="Filters">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Filter</h2>
        {anyActive ? (
          <Link href={base} className="text-xs text-primary hover:underline">
            Clear all
          </Link>
        ) : null}
      </div>

      <div>
        <h3 className="mb-1.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Shortcuts
        </h3>
        <ul>
          <li>
            <Link
              className="bl-facet"
              href={buildHref(base, current, "quickWins", "1")}
              aria-current={current.quickWins ? "true" : undefined}
              scroll={false}
              title="Free, low effort, high priority"
            >
              <span className="whitespace-nowrap">Quick wins</span>
              <span className="bl-facet__count">{counts.quickWins ?? ""}</span>
            </Link>
          </li>
          <li>
            <Link
              className="bl-facet"
              href={buildHref(base, current, "freeOnly", "1")}
              aria-current={current.freeOnly ? "true" : undefined}
              scroll={false}
              title="Free or has a free tier"
            >
              <span className="whitespace-nowrap">Nothing to pay</span>
              <span className="bl-facet__count">{counts.freeCount ?? ""}</span>
            </Link>
          </li>
        </ul>
      </div>

      <Group
        title="Type"
        base={base}
        current={current}
        paramKey="group"
        options={groups.map((g) => [g.id, g.label])}
        counts={facets.group}
      />
      <Group
        title="Cost"
        base={base}
        current={current}
        paramKey="cost"
        options={Object.entries(COST_LABELS)}
        counts={facets.cost}
      />
      <Group
        title="Effort"
        base={base}
        current={current}
        paramKey="effort"
        options={Object.entries(EFFORT_LABELS)}
        counts={facets.effort}
      />
      <Group
        title="Priority"
        base={base}
        current={current}
        paramKey="priority"
        options={Object.entries(PRIORITY_LABELS)}
        counts={facets.priority}
      />
      <Group
        title="Status"
        base={base}
        current={current}
        paramKey="status"
        options={Object.entries(STATUS_LABELS)}
        counts={facets.status}
      />
    </aside>
  );
}

export { buildHref };
