const seo = {
  intro:
    "This builder keeps every business licence — trade licence, FSSAI, fire NOC, factory licence, pollution consent — on a single board and works out the date each renewal has to start, by subtracting the licence's own lead time from its expiry date. It carries the lead times the governing rules expect, such as the 120-day window that State Pollution Control Boards want for a Consent to Operate renewal and the pre-expiry application FSSAI requires before the Rs 100-per-day late fee begins. Everything is computed in your browser; no licence number is uploaded anywhere.",
  useCases: [
    "Give an operations manager one printed board showing which of eleven licences expire in the next quarter.",
    "Work back from a fire NOC expiry to the date the inspection has to be requested.",
    "Spot the licence that has already lapsed before an inspector does.",
    "Derive an expiry date for a certificate that only shows an issue date and a five-year validity.",
  ],
  benefits: [
    ["Reminder date, not just expiry", "Each row shows the day the renewal has to start, which is the date that actually matters."],
    ["Rule-based lead times", "Defaults come from the licence's own rule rather than an arbitrary 30 days for everything."],
    ["Nothing leaves the browser", "Licence numbers stay on your device — the board is computed locally."],
  ],
  faqs: [
    [
      "When should I apply to renew an FSSAI licence?",
      "Before it expires — the Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations, 2011 charge a late fee of Rs 100 for every day of delay, and once a licence has lapsed you have to apply for a fresh one rather than a renewal. Starting 30 days ahead leaves room for a query from the licensing authority.",
    ],
    [
      "Does an Importer Exporter Code expire?",
      "No, but since DGFT Notification 58/2015-20 dated 12 February 2021 it has to be updated electronically every year between April and June, even when none of the details have changed. An IEC that is not updated in that window is deactivated until it is updated.",
    ],
    [
      "How long is a municipal trade licence valid?",
      "In most municipal corporations it runs for a financial year and is renewed by 31 March, with a penalty and in some cities a compounding fee for late renewal. Some corporations now issue multi-year licences, so check the validity printed on your own certificate rather than assuming a year.",
    ],
    [
      "What happens if a licence expires while the renewal is pending?",
      "It depends on the statute. Some rules deem the licence to continue while a timely renewal application is under consideration, others treat any gap as operating without a licence. That is why the board works back from expiry using the lead time each authority expects — a timely application is usually what protects you, not the renewal being granted in time.",
    ],
  ],
};

export default seo;
