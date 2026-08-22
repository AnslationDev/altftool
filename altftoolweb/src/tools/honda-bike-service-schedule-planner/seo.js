const seo = {
  title: "Honda Two-Wheeler Service Schedule Planner",
  metaDescription:
    "Dates every Honda service at 1,000 km, 4,000 km then every 3,000 km, whichever comes first, with the chain or CVT parts and cost due at each visit.",
  steps: [
    "Pick a Vehicle type — 'Motorcycle (chain drive)' or 'Scooter (CVT / belt drive)' — then enter 'Purchase / registration date', 'Current odometer (km)' and 'Average running (km per month)'.",
    "Set 'Services to plan (1-20)' and 'Free services in your package', adjust 'First service due at (km)', 'Second service due at (km)' and 'Periodic interval after that (km)' if your service book differs, and enter 'Labour per paid service (INR)' and 'Parts price level (% of listed)'.",
    "Read 'Next service due at' with its approximate date and free-or-paid flag, then the Service schedule table (#, Due at, Approx. date, Type, Parts due, Cost) and the totals for 'Parts across the plan', 'Labour across the plan' and 'Total estimated cost'. 'Copy result' copies the plan.",
  ],
  intro:
    "This planner converts a Honda two-wheeler's maintenance chart into a dated list of visits, showing the kilometre and the month at which each free and paid service falls due and which consumables land on each one. Honda models in India typically use a running-in service near 1,000 km or 1 month, a second visit around 4,000 km or 4 months, and a repeating 3,000 km cycle after that. Motorcycles and scooters share the visit schedule but get different parts lists, because a chain drive and a CVT wear in different places.",
  useCases: [
    "Planning the next free service on a new Activa or Shine that covers roughly 700 km a month",
    "Seeing which visit the CVT drive belt and roller weights fall due on for a scooter",
    "Estimating what the first two paid services will cost once the free coupons are used up",
  ],
  benefits: [
    ["Scooter and motorcycle handled separately", "Chain and sprocket for a bike, drive belt, rollers and gear oil for a CVT scooter."],
    ["Whichever comes first", "Each visit is dated at the earlier of the kilometre and month trigger, as the warranty reads."],
    ["Parts mapped to the right visit", "Oil, air filter and plug appear on the service where they actually fall due."],
  ],
  faqs: [
    [
      "When is the first service due on a new Honda two-wheeler?",
      "At about 1,000 km or one month from purchase, whichever comes first. That first visit drains the running-in oil, which carries the metal particles shed while the engine beds in, so it matters more than any later service.",
    ],
    [
      "How many free services does Honda give with a new bike or scooter?",
      "The standard package on most Honda models in India covers three free services, and extended packages add more. The coupons are in your service book with both a distance and a date window printed on each one, so set the free-service count in the planner to match your book.",
    ],
    [
      "Can the air filter on a Honda scooter be cleaned instead of replaced?",
      "No. Honda uses a viscous paper element treated with oil, and blowing it out with compressed air destroys the treatment and lets dust through. It is a replace-only part, typically around every 12,000 km, or sooner in very dusty conditions.",
    ],
    [
      "How often does a Honda scooter drive belt need changing?",
      "A CVT drive belt is generally inspected at each service and replaced around every 24,000 km, along with the variator roller weights, which wear flat and cause poor pickup. A belt that is cracking, glazed or narrower than the service limit should be replaced early; ask your dealer to measure it rather than going by distance alone.",
    ],
  ],
};

export default seo;
