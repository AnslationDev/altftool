const seo = {
  title: "India Hosting Cost Comparison: VPS vs Cloud",
  metaDescription:
    "Price one workload as VPS, hourly cloud and managed hosting in rupees, with the 730-hour month, egress above free allowance and 18% GST included.",
  steps: [
    "Describe the workload: vCPU, RAM (GB), Storage (GB), 'Monthly outbound transfer (GB)', 'Running hours per month (max 730)' and a USD-to-INR rate for USD-priced plans.",
    "Replace the seeded 'Rate cards' with your real quotes — flat monthly or hourly rate, free egress (GB), egress per extra GB, backup, management and commitment discount.",
    "Read the cheapest option per month including 18% GST, the 3-year total, the 'Where the money goes' breakdown and the egress volume where the top two swap places; 'Copy comparison' exports it.",
  ],
  intro:
    "This calculator prices the same workload as a self-managed VPS, as hourly cloud compute and as managed hosting, then ranks them in rupees per month, per year and over three years. It uses the 730-hour billing month that cloud providers apply (365 × 24 ÷ 12), charges outbound transfer only above each plan's free allowance, and adds 18% GST on top, which is the rate for IT infrastructure and hosting services in India. It also reports the egress volume at which the top two options swap places.",
  useCases: [
    "Deciding whether to move a steady-state application off hourly cloud compute onto a fixed-price Indian VPS",
    "Explaining to a founder why a ₹1,400 VPS and a cloud instance of the same size end up an order of magnitude apart once transfer is counted",
    "Sizing the three-year total cost of ownership for a hosting line in a funding or budget model",
  ],
  benefits: [
    ["Egress is the punchline", "Transfer above the free allowance is priced separately, because that is usually where the difference lives."],
    ["Correct billing month", "Hourly plans are multiplied by 730 hours, not 720, matching how cloud invoices are actually calculated."],
    ["Break-even point", "Shows the monthly transfer volume at which the cheapest option stops being cheapest."],
  ],
  faqs: [
    [
      "How many hours are in a cloud billing month?",
      "730 hours. Providers divide 8,760 hours in a year by 12 months, so an always-on instance is billed for 730 hours regardless of whether the month has 28 or 31 days. Multiplying an hourly rate by 720 (24 × 30) understates the bill by roughly 1.4%.",
    ],
    [
      "Is GST charged on hosting in India?",
      "Yes, at 18% for IT infrastructure and hosting services. If you are GST registered and the supplier bills from an Indian entity, that GST is normally available as input tax credit, so compare ex-GST figures for cash-flow planning and inclusive figures for what actually leaves the bank. Services billed from outside India may attract reverse-charge treatment instead — check with your accountant.",
    ],
    [
      "Does 1 TB of bandwidth mean 1000 GB or 1024 GB?",
      "Hosting providers quote transfer in decimal terabytes, so 1 TB means 1,000 GB. Disk capacity is sometimes quoted the other way, which is why a 1 TB drive shows as about 931 GiB in the operating system. This calculator treats transfer as decimal.",
    ],
    [
      "Is a VPS actually cheaper than cloud hosting?",
      "On the invoice, usually yes for a steady workload with heavy outbound traffic — generous or unmetered transfer allowances are the main reason. The comparison changes when your load is spiky and you can genuinely scale to zero, when you need managed databases and load balancers you would otherwise run yourself, or when you count the engineering hours a self-managed box consumes for patching, backups and out-of-hours recovery.",
    ],
  ],
};

export default seo;
