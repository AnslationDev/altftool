const seo = {
  intro:
    "The Video Production Budget Calculator builds a quotable total from four cost blocks — crew day rates, gear rental, post-production hours and flat costs — then applies contingency, a production fee and tax in the order production companies actually quote them. Contingency is added to direct costs first, the fee is charged on that combined base, and tax is applied last to the pre-tax total. It also divides the result into a cost per finished minute and a cost per shoot day so you can sanity-check a quote against past jobs.",
  useCases: [
    "Quoting a two-day brand film with four crew, two gear packages and 24 hours of edit time.",
    "Showing a client why a 10% contingency line exists before they ask you to strip it out.",
    "Comparing an in-house shoot against an agency quote by reducing both to cost per finished minute.",
    "Testing what happens to the total when the shoot slips from two days to three and every day rate repeats.",
  ],
  benefits: [
    ["Quoting order, not guesswork", "Contingency before fee, tax last — the same build-up a production company puts on a real estimate."],
    ["Unit economics included", "Cost per finished minute and per shoot day turn a lump sum into a number you can benchmark."],
    ["Transparent line items", "Crew, gear, post and flat costs stay separate with their share of direct spend shown."],
  ],
  faqs: [
    [
      "How do you calculate a video production budget?",
      "Total your direct costs (crew days x day rate, gear rental days, post-production hours x hourly rate, and flat costs like travel and licences), add a contingency percentage, then add your production fee on top of that combined figure and apply tax last. A common shape is 10% contingency and a 15% production fee.",
    ],
    [
      "How much contingency should a video budget include?",
      "10% of direct costs is the usual starting point for a straightforward commercial shoot, rising towards 15-20% when you have exterior locations, live subjects, travel or a compressed schedule. Contingency covers overruns you can reasonably foresee, not scope the client added later.",
    ],
    [
      "What GST applies to video production in India?",
      "Audio-visual and advertising production services fall in the 18% GST slab, which is the default used here. Place of supply, export status and reverse-charge rules can change what you actually charge, so confirm the treatment with your accountant before raising the invoice — this tool is an estimating aid, not tax advice.",
    ],
    [
      "What is a reasonable cost per finished minute of video?",
      "It varies enormously — the same crew can produce a 3-minute brand film and a 30-minute documentary at wildly different per-minute costs — so use the figure to compare your own jobs rather than against an industry average. Divide the grand total by the delivered runtime and track it across projects to see which formats are quietly unprofitable.",
    ],
  ],
};

export default seo;
