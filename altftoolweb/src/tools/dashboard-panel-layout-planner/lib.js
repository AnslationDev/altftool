/**
 * Dashboard Panel Layout Planner — pure logic. No React, no DOM.
 *
 * Methods implemented:
 *  - RED   (Tom Wilkie): Rate, Errors, Duration — one set per request-driven service.
 *  - USE   (Brendan Gregg): Utilisation, Saturation, Errors — one set per resource.
 *  - Four Golden Signals (Google SRE Book, ch. 6): Latency, Traffic, Errors, Saturation.
 *
 * Layout rules come from Grafana's dashboard grid and its "best practices" guidance:
 * most important panel top-left, overview rows above detail rows.
 */

/** Grafana's dashboard grid is 24 columns wide. */
export const GRID_COLUMNS = 24;
/** One Grafana grid height unit renders 30px tall with 10px of margin. */
export const GRID_UNIT_PX = 30;
export const GRID_MARGIN_PX = 10;
/** Default panel height in grid units (Grafana's default for a new time series panel). */
export const DEFAULT_PANEL_HEIGHT = 8;
/** Panel counts above this get slow to load and hard to read on one screen. */
export const PANEL_COUNT_WARNING = 20;
/**
 * Fast-burn alert factor from the Google SRE Workbook multiwindow multi-burn-rate
 * table: burning 14.4x budget over 1 hour consumes 2% of a 30-day error budget.
 */
export const FAST_BURN_FACTOR = 14.4;

/** Only widths that divide the 24-column grid evenly are offered. */
export const PANELS_PER_ROW_OPTIONS = [2, 3, 4];

export const METHODS = [
  {
    id: "red",
    label: "RED — Rate, Errors, Duration",
    best: "Request-driven services: HTTP APIs, gRPC, GraphQL.",
    source: "Tom Wilkie, Weaveworks",
  },
  {
    id: "use",
    label: "USE — Utilisation, Saturation, Errors",
    best: "Resources: CPU, memory, disks, network, pools, queues.",
    source: "Brendan Gregg",
  },
  {
    id: "golden",
    label: "Four Golden Signals",
    best: "A user-facing service where you want latency, traffic, errors and saturation on one screen.",
    source: "Google SRE Book, chapter 6",
  },
];

export const USE_RESOURCES = [
  { id: "cpu", label: "CPU" },
  { id: "memory", label: "Memory" },
  { id: "disk", label: "Disk I/O" },
  { id: "network", label: "Network" },
  { id: "pool", label: "Connection pool" },
];

/** Refresh intervals offered, in seconds. */
export const REFRESH_OPTIONS = [10, 30, 60, 300];

const SECONDS_PER_MINUTE = 60;

const q = (text, service) => text.replaceAll("$SVC", service);

function redPanels(service) {
  return [
    {
      title: "Request rate",
      viz: "Time series",
      unit: "requests/sec",
      why: "Traffic level — the denominator for every other panel on this dashboard.",
      query: q('sum(rate(http_requests_total{service="$SVC"}[5m]))', service),
    },
    {
      title: "Error rate (%)",
      viz: "Time series",
      unit: "percent (0-100)",
      why: "Failed requests as a share of total, not a raw count — a raw count hides traffic drops.",
      query: q(
        'sum(rate(http_requests_total{service="$SVC",status=~"5.."}[5m]))\n  / sum(rate(http_requests_total{service="$SVC"}[5m])) * 100',
        service,
      ),
    },
    {
      title: "Latency p50 / p95 / p99",
      viz: "Time series",
      unit: "seconds",
      why: "Percentiles, never a mean — a mean hides the tail your users actually feel.",
      query: q(
        'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{service="$SVC"}[5m])))',
        service,
      ),
    },
  ];
}

function goldenPanels(service) {
  return [
    ...redPanels(service).map((panel, index) =>
      index === 0 ? { ...panel, title: "Traffic (request rate)" } : panel,
    ),
    {
      title: "Saturation",
      viz: "Time series",
      unit: "percent (0-100)",
      why: "How full the most constrained resource is — the signal that predicts the next three signals going bad.",
      query: q(
        'max(container_memory_working_set_bytes{service="$SVC"})\n  / max(container_spec_memory_limit_bytes{service="$SVC"}) * 100',
        service,
      ),
    },
  ];
}

const USE_PANELS = {
  cpu: [
    {
      title: "utilisation",
      unit: "percent (0-100)",
      why: "Share of time the CPU was busy.",
      query: '(1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100',
    },
    {
      title: "saturation (run queue)",
      unit: "load",
      why: "Load average per core above 1 means work is waiting for CPU.",
      query: 'node_load1 / count(count by (cpu) (node_cpu_seconds_total{mode="idle"}))',
    },
  ],
  memory: [
    {
      title: "utilisation",
      unit: "percent (0-100)",
      why: "Used memory against the limit, not against the host total.",
      query: "(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100",
    },
    {
      title: "saturation (swap and OOM kills)",
      unit: "events/sec",
      why: "Swapping or OOM kills mean the box has already lost.",
      query: "rate(node_vmstat_pswpout[5m])",
    },
  ],
  disk: [
    {
      title: "utilisation",
      unit: "percent (0-100)",
      why: "Fraction of time the device had at least one I/O in flight.",
      query: "rate(node_disk_io_time_seconds_total[5m]) * 100",
    },
    {
      title: "saturation (queue depth)",
      unit: "ops",
      why: "Weighted I/O time rising means requests are queueing at the device.",
      query: "rate(node_disk_io_time_weighted_seconds_total[5m])",
    },
    {
      title: "errors",
      unit: "errors/sec",
      why: "Rare, but never noise — surface it rather than discover it in dmesg.",
      query: "rate(node_disk_io_errors_total[5m])",
    },
  ],
  network: [
    {
      title: "utilisation (throughput)",
      unit: "bytes/sec",
      why: "Receive and transmit against the interface capacity.",
      query: "rate(node_network_receive_bytes_total[5m])",
    },
    {
      title: "saturation (drops)",
      unit: "packets/sec",
      why: "Dropped packets are the honest saturation signal for a NIC.",
      query: "rate(node_network_receive_drop_total[5m])",
    },
    {
      title: "errors",
      unit: "errors/sec",
      why: "Interface errors point at cabling, MTU or driver problems, not load.",
      query: "rate(node_network_receive_errs_total[5m])",
    },
  ],
  pool: [
    {
      title: "utilisation",
      unit: "percent (0-100)",
      why: "Checked-out connections against pool size.",
      query: "sum(db_pool_in_use) / sum(db_pool_max) * 100",
    },
    {
      title: "saturation (wait time)",
      unit: "seconds",
      why: "Time callers spend waiting for a free connection — the first symptom of a too-small pool.",
      query: "rate(db_pool_wait_seconds_total[5m]) / rate(db_pool_wait_count_total[5m])",
    },
    {
      title: "errors (acquire timeouts)",
      unit: "errors/sec",
      why: "Acquire timeouts mean requests are already failing.",
      query: "rate(db_pool_timeouts_total[5m])",
    },
  ],
};

function sloPanels(service, sloTarget) {
  const budget = 100 - sloTarget;
  return [
    {
      title: `SLO compliance (${sloTarget}% target, 30d)`,
      viz: "Stat",
      unit: "percent (0-100)",
      why: "The one number a stakeholder should read without asking a question.",
      query: q(
        'sum(rate(http_requests_total{service="$SVC",status!~"5.."}[30d]))\n  / sum(rate(http_requests_total{service="$SVC"}[30d])) * 100',
        service,
      ),
    },
    {
      title: "Error budget remaining",
      viz: "Gauge",
      unit: "percent (0-100)",
      why: `A ${sloTarget}% target leaves a ${budget.toFixed(2)}% error budget over the 30-day window.`,
      query: q(
        `(1 - (sum(rate(http_requests_total{service="$SVC",status=~"5.."}[30d]))\n  / sum(rate(http_requests_total{service="$SVC"}[30d]))) / ${(budget / 100).toPrecision(3)}) * 100`,
        service,
      ),
    },
    {
      title: `Fast burn rate (1h, alert above ${FAST_BURN_FACTOR}x)`,
      viz: "Time series",
      unit: "multiplier",
      why: `Burning ${FAST_BURN_FACTOR}x for one hour spends 2% of a 30-day budget — the SRE Workbook page threshold.`,
      query: q(
        `(sum(rate(http_requests_total{service="$SVC",status=~"5.."}[1h]))\n  / sum(rate(http_requests_total{service="$SVC"}[1h]))) / ${(budget / 100).toPrecision(3)}`,
        service,
      ),
    },
  ];
}

function chunk(items, size) {
  const rows = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

/**
 * Plan the dashboard.
 *
 * @returns {{ rows: Array, panelCount: number, rowCount: number, gridHeightUnits: number,
 *   pixelHeight: number, queriesPerMinute: number, warning: string|null, method: object }
 *   | { error: string }}
 */
export function planDashboard({
  service = "",
  methodId = "red",
  resources = [],
  panelsPerRow = 3,
  includeSlo = true,
  sloTarget = 99.9,
  includeLogs = true,
  refreshSeconds = 60,
  panelHeight = DEFAULT_PANEL_HEIGHT,
} = {}) {
  const serviceName = String(service).trim();
  if (!serviceName) return { error: "Enter the service name the dashboard is for." };
  if (!/^[a-zA-Z0-9._-]+$/.test(serviceName)) {
    return { error: "Service name should use letters, digits, dot, underscore or hyphen only — it goes into a label matcher." };
  }

  const method = METHODS.find((item) => item.id === methodId);
  if (!method) return { error: "Pick a dashboard method." };

  if (!PANELS_PER_ROW_OPTIONS.includes(Number(panelsPerRow))) {
    return { error: "Panels per row must be 2, 3 or 4 so the panels divide the 24-column grid evenly." };
  }
  const perRow = Number(panelsPerRow);

  const target = Number(sloTarget);
  if (includeSlo && (!Number.isFinite(target) || target <= 0 || target >= 100)) {
    return { error: "SLO target must be above 0% and below 100%." };
  }

  const refresh = Number(refreshSeconds);
  if (!Number.isFinite(refresh) || refresh <= 0) {
    return { error: "Refresh interval must be greater than zero seconds." };
  }

  const height = Number(panelHeight);
  if (!Number.isFinite(height) || height < 3 || height > 24) {
    return { error: "Panel height must be between 3 and 24 grid units." };
  }

  const sections = [];

  if (includeSlo) {
    sections.push({
      name: "1. Is the service meeting its promise?",
      note: "Overview row. A reader who looks at nothing else should still learn whether users are being hurt.",
      panels: sloPanels(serviceName, target),
    });
  }

  if (method.id === "red" || method.id === "golden") {
    const panels = method.id === "red" ? redPanels(serviceName) : goldenPanels(serviceName);
    sections.push({
      name: `${sections.length + 1}. ${method.id === "red" ? "RED signals" : "Four Golden Signals"}`,
      note: "Rate first, then errors, then latency — read left to right, worst case last.",
      panels: panels.map((panel) => ({ viz: "Time series", ...panel })),
    });
  }

  const chosen = Array.isArray(resources) ? resources : [];
  const useResources = method.id === "use" ? (chosen.length > 0 ? chosen : ["cpu", "memory"]) : chosen;

  if (useResources.length > 0) {
    const panels = [];
    for (const id of useResources) {
      const group = USE_PANELS[id];
      if (!group) continue;
      const label = USE_RESOURCES.find((item) => item.id === id)?.label || id;
      for (const panel of group) {
        panels.push({ viz: "Time series", ...panel, title: `${label} ${panel.title}` });
      }
    }
    if (panels.length === 0) return { error: "None of the selected resources are known — pick from the list." };
    sections.push({
      name: `${sections.length + 1}. USE signals per resource`,
      note: "Utilisation, saturation and errors for every resource the service depends on.",
      panels,
    });
  }

  if (includeLogs) {
    sections.push({
      name: `${sections.length + 1}. Drill-down`,
      note: "Detail row. Nothing here should be needed to answer 'is it broken?' — only 'why?'.",
      panels: [
        {
          title: "Recent errors (logs)",
          viz: "Logs",
          unit: "lines",
          why: "Filtered to the same time range so a spike above lands you on the matching lines.",
          query: q('{service="$SVC"} |= "error"', serviceName),
        },
        {
          title: "Deploys and config changes",
          viz: "Annotations list",
          unit: "events",
          why: "Most incidents start with a change — put the changes on the same time axis.",
          query: q('changes(kube_deployment_status_observed_generation{deployment="$SVC"}[5m]) > 0', serviceName),
        },
      ],
    });
  }

  if (sections.length === 0) {
    return { error: "Nothing selected — enable an SLO row, a method with panels, or the drill-down row." };
  }

  const rows = [];
  for (const section of sections) {
    const grouped = chunk(section.panels, perRow);
    grouped.forEach((panels, index) => {
      rows.push({
        section: section.name,
        note: index === 0 ? section.note : "",
        showHeading: index === 0,
        panels: panels.map((panel) => ({
          ...panel,
          width: GRID_COLUMNS / perRow,
          height,
        })),
      });
    });
  }

  const panelCount = rows.reduce((total, row) => total + row.panels.length, 0);
  const rowCount = rows.length;
  const gridHeightUnits = rowCount * height;
  const pixelHeight = gridHeightUnits * GRID_UNIT_PX + rowCount * GRID_MARGIN_PX;
  const queriesPerMinute = (panelCount * SECONDS_PER_MINUTE) / refresh;

  return {
    rows,
    method,
    panelCount,
    rowCount,
    panelWidth: GRID_COLUMNS / perRow,
    panelHeight: height,
    gridHeightUnits,
    pixelHeight,
    queriesPerMinute,
    warning:
      panelCount > PANEL_COUNT_WARNING
        ? `${panelCount} panels is past the ${PANEL_COUNT_WARNING}-panel point where dashboards get slow and stop being scannable — split the drill-down into a second dashboard.`
        : null,
  };
}
