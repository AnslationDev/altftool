const seo = {
  title: "Change Freeze Calendar Planner for Release",
  metaDescription:
    "Turn protected dates into dated freeze windows: overlaps merge, and you see total days, Mon–Fri days frozen, and the release gaps between blocks.",
  intro:
    "A change freeze planner that converts a list of protected dates into dated freeze windows, merges the ones that overlap, and totals how many days and working days of the year end up frozen. Each event gets its own lead and trail padding, so a five-day pre-sale freeze and a two-day post-close freeze are modelled separately rather than averaged. Built around the Indian financial year ending 31 March and the festive sale calendar, with moving dates such as Diwali and Black Friday entered by hand instead of guessed.",
  useCases: [
    "Publishing next year's deployment freeze calendar to engineering before sprint planning starts",
    "Showing leadership that stacking a Diwali freeze onto a 31 March fiscal close leaves only a handful of shippable weeks in Q4",
    "Finding the longest gap between freeze blocks so a risky migration can be scheduled where there is real room to roll back",
  ],
  benefits: [
    ["Overlaps merged automatically", "Back-to-back freezes are joined into one block so you see the true length, not two short ones."],
    ["Counts working days too", "Total days and Monday-to-Friday days are reported separately, because weekends were never release days."],
    ["Shows the gaps", "The release windows between freezes are listed with their weekday counts."],
  ],
  faqs: [
    [
      "How long should a change freeze be before a big sale?",
      "Most e-commerce teams freeze 3 to 7 days before the sale opens and 2 to 4 days after it closes. The pre-sale padding matters more than the post-sale padding: it gives load tests, cache warmers and third-party integrations time to settle, and it means any regression is found while engineers are still watching rather than mid-event.",
    ],
    [
      "When does the Indian financial year end?",
      "31 March. Indian companies close books for the financial year on 31 March and file for the assessment year that follows, which is why finance, billing and reporting systems typically sit under a freeze from around 26 March to the first few days of April. Calendar quarter ends on 30 June, 30 September and 31 December matter separately if you report to a group parent on a calendar year.",
    ],
    [
      "Should security patches be blocked during a change freeze?",
      "No. A freeze that has no exception path encourages people to route around it. Define an explicit carve-out for security fixes, Sev-1 incident remediation and config-only rollbacks, name who can approve one, and require the same testing and rollback plan as a normal change — just with a shorter approval chain.",
    ],
    [
      "Why are Diwali and Black Friday not filled in automatically?",
      "Because they move. Diwali follows the Hindu lunar calendar and shifts by two to three weeks year to year, and Black Friday is the Friday after the fourth Thursday of November in the US calendar. A wrong date here would silently misplace your longest freeze, so the tool asks for it rather than assuming.",
    ],
  ],
};

export default seo;
