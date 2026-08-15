const seo = {
  title: "Grafana Dashboard Layout Planner: RED, USE",
  metaDescription:
    "Plans service dashboard panels from RED, USE or the Four Golden Signals, sized to Grafana's 24-column grid, with an SLO row and starter PromQL per panel.",
  steps: [
    "Enter a Service name, pick a Method — RED (Rate, Errors, Duration), USE (Utilisation, Saturation, Errors) or Four Golden Signals — set Panels per row (2, 3 or 4) and toggle the USE resources: CPU, Memory, Disk I/O, Network, Connection pool.",
    "Set Panel height (grid units), a Refresh interval from 10 seconds to 5 minutes and the SLO target (%), with checkboxes to add the SLO / error-budget row and the logs / deploys drill-down row; the plan recomputes live.",
    "Read the panel count, rows, panel size on the 24-column grid and queries per minute, then review 'Panel order, top to bottom' with a starter PromQL query per panel; Copy plan puts the numbered plan on the clipboard.",
  ],
  intro:
    "A dashboard panel layout planner decides which panels a service dashboard needs and what order they appear in, using the RED method (Rate, Errors, Duration), the USE method (Utilisation, Saturation, Errors) or Google's Four Golden Signals. It sizes each panel against Grafana's 24-column grid, adds an SLO and error-budget row on top, and gives a starter PromQL query per panel. The output is a plan you can build against rather than a dashboard that grew one panel at a time.",
  useCases: [
    "Standing up the first dashboard for a new HTTP service without copying an unrelated team's board",
    "Auditing an existing dashboard that has drifted to 40 panels and deciding which belong on a drill-down board",
    "Preparing the SLO, error-budget and burn-rate panels a production readiness review expects to see",
  ],
  benefits: [
    ["Method-driven, not habit-driven", "Panels come from RED, USE or the Four Golden Signals instead of whatever was easy to graph."],
    ["Grid-accurate sizing", "Widths divide Grafana's 24 columns evenly, so rows line up instead of leaving orphan gaps."],
    ["Query load in the open", "Shows how many datasource queries per minute the layout and refresh interval will cost."],
  ],
  faqs: [
    [
      "What is the difference between the RED and USE methods?",
      "RED describes requests, USE describes resources. RED (Rate, Errors, Duration) is Tom Wilkie's method for request-driven services like an HTTP API; USE (Utilisation, Saturation, Errors) is Brendan Gregg's method applied per resource — CPU, memory, disk, network, connection pool. Most real dashboards need both: RED at the top for the user's view, USE below for the cause.",
    ],
    [
      "What are the Four Golden Signals?",
      "Latency, traffic, errors and saturation, defined in chapter 6 of the Google SRE Book. They are effectively RED plus saturation, and the guidance is that if you can only measure four things about a user-facing system, measure these.",
    ],
    [
      "How many panels should a dashboard have?",
      "Keep the top screen to roughly six to nine panels, and the whole board under about 20. Past that, load time climbs and nobody can scan it during an incident — move the detail to a linked drill-down dashboard instead.",
    ],
    [
      "How wide is the Grafana dashboard grid?",
      "24 columns. A half-width panel is 12 columns, a third is 8 and a quarter is 6, which is why panels per row of 2, 3 or 4 tile cleanly and 5 does not. Height is measured in the same grid units, each about 30 pixels tall plus margin.",
    ],
  ],
};

export default seo;
