import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Globe, PieChart, Route, TrendingUp } from "lucide-react";

const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const METHOD_STROKE = {
  GET: "stroke-info",
  POST: "stroke-success",
  PUT: "stroke-warning",
  PATCH: "stroke-warning",
  DELETE: "stroke-danger",
  OPTIONS: "stroke-muted-foreground",
  HEAD: "stroke-muted-foreground",
};

function Sparkline({ series, downIsGood }) {
  if (series.length < 2) return null;
  const width = 76;
  const height = 26;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * (width - 4) + 2;
      const y = height - 3 - ((value - min) / span) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const rising = series.at(-1) >= series[0];
  const good = downIsGood ? !rising : rising;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-7 w-20 shrink-0 ${good ? "text-success" : "text-danger"}`}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MethodMiniDonut({ byMethod }) {
  const total = byMethod.reduce((sum, item) => sum + item.value, 0);
  if (!total) return null;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const segments = byMethod.reduce((all, item) => {
    const offset = all.length ? all.at(-1).offset + all.at(-1).length : 0;
    return [...all, { ...item, offset, length: (item.value / total) * circumference }];
  }, []);

  return (
    <svg viewBox="0 0 36 36" className="h-12 w-12 shrink-0 -rotate-90" aria-hidden="true">
      {segments.map((item) => (
        <circle
          key={item.name}
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeDasharray={`${Math.max(item.length - 1.5, 0.5)} ${circumference}`}
          strokeDashoffset={-item.offset}
          className={METHOD_STROKE[item.name] || "stroke-muted-foreground"}
        />
      ))}
    </svg>
  );
}

function DeltaLine({ current, prior, downIsGood, suffix = "vs last scan" }) {
  if (prior == null) {
    return <p className="mt-1 text-xs text-muted-foreground">first scan</p>;
  }
  if (prior === current) {
    return <p className="mt-1 text-xs text-muted-foreground">no change {suffix}</p>;
  }
  const pct = prior === 0 ? 100 : Math.round(((current - prior) / prior) * 100);
  const rising = current > prior;
  const good = downIsGood ? !rising : rising;
  const Icon = rising ? ArrowUpRight : ArrowDownRight;
  return (
    <p
      className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${
        good ? "text-success" : "text-danger"
      }`}
    >
      <Icon aria-hidden="true" size={13} />
      {Math.abs(pct)}% {suffix}
    </p>
  );
}

function Card({ icon: Icon, iconClass, label, value, children, aside }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
            <Icon aria-hidden="true" size={15} />
          </span>
          <p className="truncate text-xs font-semibold text-muted-foreground">{label}</p>
        </div>
        <p className="mt-2 text-2xl font-bold tabular-nums leading-none text-foreground">{value}</p>
        {children}
      </div>
      {aside}
    </div>
  );
}

export default function StatCards({ scan, history }) {
  const { totals, byMethod } = scan;
  // History entries are recorded on scan actions; the latest normally mirrors
  // the current totals, so trends compare against the entry before it.
  const prior = history.length >= 2 ? history[history.length - 2] : null;
  const series = (metric) => history.map((entry) => entry[metric]);

  const methodNames = byMethod.map((item) => item.name).join(", ");
  const unusedShare = totals.endpoints
    ? Math.round((totals.unused / totals.endpoints) * 100)
    : 0;

  return (
    <section aria-label="Scan summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card
        icon={Route}
        iconClass="bg-primary/10 text-primary"
        label="Total Endpoints"
        value={numberFormat.format(totals.endpoints)}
        aside={<Sparkline series={series("endpoints")} />}
      >
        <DeltaLine current={totals.endpoints} prior={prior?.endpoints ?? null} />
      </Card>

      <Card
        icon={Globe}
        iconClass="bg-info-soft text-info"
        label="Unique Domains"
        value={numberFormat.format(totals.domains)}
        aside={<Sparkline series={series("domains")} />}
      >
        <DeltaLine current={totals.domains} prior={prior?.domains ?? null} />
      </Card>

      <Card
        icon={PieChart}
        iconClass="bg-primary/10 text-primary"
        label="HTTP Methods"
        value={numberFormat.format(totals.methods)}
        aside={<MethodMiniDonut byMethod={byMethod} />}
      >
        <p className="mt-1 truncate text-xs text-muted-foreground" title={methodNames}>
          {methodNames || "none detected"}
        </p>
      </Card>

      <Card
        icon={BarChart3}
        iconClass="bg-success-soft text-success"
        label="Total Calls (Est.)"
        value={compactFormat.format(totals.calls)}
        aside={<Sparkline series={series("calls")} />}
      >
        <DeltaLine current={totals.calls} prior={prior?.calls ?? null} />
      </Card>

      <Card
        icon={AlertTriangle}
        iconClass="bg-danger-soft text-danger"
        label="Unused Endpoints"
        value={numberFormat.format(totals.unused)}
        aside={<Sparkline series={series("unused")} downIsGood />}
      >
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp aria-hidden="true" size={12} className="text-danger" />
          {unusedShare}% of total
        </p>
      </Card>
    </section>
  );
}
