const seo = {
  title: "PUC Renewal Planner: Expiry, Booking, Cost",
  metaDescription:
    "Turn your PUC certificate date into expiry and booking dates on the 12-month first, 6-month renewal rule, with test cost by vehicle type.",
  steps: [
    "Enter the Date on the current certificate, and tick the first-certificate checkbox if it was issued with a brand-new vehicle so 12 months validity applies instead of 6.",
    "Pick a Vehicle category from two-wheeler to diesel goods vehicle, override Test fee you pay (INR) if your centre charges differently, and set the days-early booking buffer.",
    "Read Certificate valid until, the Book the next test from date and the yearly cost, then press Copy result to keep the schedule.",
  ],
  intro:
    "This planner converts the date printed on your Pollution Under Control certificate into an expiry date, a booking date and a running cost, using the validity rule in Rule 115(7) of the Central Motor Vehicles Rules, 1989 — twelve months for the certificate issued with a newly registered vehicle, six months for every renewal after that. Pick your vehicle category and it also projects how many emission tests you will pay for over the next few years. Written for private owners and small fleets who want the renewal on the calendar before a traffic stop finds it.",
  useCases: [
    "Finding the exact date a six-month PUC certificate lapses so the test can be booked a week or two earlier",
    "Budgeting emission-test charges for a household with a petrol car and a two-wheeler over five years",
    "Checking whether the one-year certificate that came with a new car is still valid before renewing insurance",
  ],
  benefits: [
    ["Correct validity applied", "Distinguishes the 12-month first certificate from every 6-month renewal."],
    ["Booking date, not just expiry", "Subtracts your chosen buffer so you test before the certificate runs out."],
    ["Cost you can plan for", "Projects the number of tests and total fee across your planning horizon."],
  ],
  faqs: [
    [
      "How long is a PUC certificate valid?",
      "Six months for most vehicles. Rule 115(7) of the Central Motor Vehicles Rules, 1989 gives the certificate issued for a newly registered vehicle a validity of one year from the date of first registration, and every certificate issued after that is valid for six months.",
    ],
    [
      "What is the penalty for driving without a valid PUC certificate?",
      "Up to ₹10,000 under section 190(2) of the Motor Vehicles Act, 1988 as amended in 2019. Several states also link the certificate to other services — for example, insurers have been directed to check for a valid PUC before renewing a policy — so a lapse can hold up more than a traffic stop.",
    ],
    [
      "Can I renew a PUC certificate before it expires?",
      "Yes. Emission testing centres will test a vehicle at any time and issue a fresh certificate dated from the test, so testing a few days early costs you only the unused days on the old certificate. That is why this planner subtracts a booking buffer from the expiry date.",
    ],
    [
      "What happens if my vehicle fails the emission test?",
      "No certificate is issued. The vehicle has to be repaired — commonly a service, a new air filter, spark plugs or injector cleaning — and retested, and you pay the test fee again. Until it passes, the vehicle is being driven without a valid certificate, so plan the test with enough time for a repair.",
    ],
  ],
};

export default seo;
