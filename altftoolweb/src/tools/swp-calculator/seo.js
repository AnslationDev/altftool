const seo = {
  title: "SWP Calculator — Corpus Life & Step-Up",
  h1: "SWP Calculator",
  metaDescription:
    "Free SWP calculator: month-by-month simulation of a mutual fund corpus with annual step-up, gain tax estimate, safe withdrawal figure and CSV export.",
  intro:
    "The SWP Calculator simulates a systematic withdrawal plan month by month for up to 45 years, converting your expected annual return to a monthly rate with the geometric formula (1 + r)^(1/12) − 1 rather than a simple r ÷ 12, and applying each withdrawal either before or after that month's growth depending on the timing you choose. Tax is estimated on the gain portion only: it tracks your invested cost basis, treats (corpus − cost basis) ÷ corpus as the taxable share of every rupee withdrawn, and reduces the basis as capital is returned. A separate 44-iteration binary search finds the highest first-month withdrawal that still survives your chosen tenure. All of it runs in JavaScript in your browser — no account, no server round trip.",
  useCases: [
    "Checking whether a ₹50 lakh corpus can pay ₹40,000 a month for 25 years at an 8% return with a 5% annual step-up",
    "Finding the safe first-month withdrawal a corpus can support before committing to a monthly payout",
    "Exporting the year-by-year opening balance, withdrawal, estimated tax and closing balance as CSV for a spreadsheet or an advisor review",
  ],
  benefits: [
    [
      "Month-level simulation, not an annual shortcut",
      "Growth and withdrawal are applied 12 times a year across up to 540 months, and the annual return is converted geometrically with (1 + r)^(1/12) − 1.",
    ],
    [
      "Safe withdrawal solved by binary search",
      "44 bisection passes re-run the full simulation to converge on the largest first-month withdrawal that still lasts the whole tenure — a number, not trial and error.",
    ],
    [
      "Gain-only tax estimate",
      "Enter your invested cost basis and each withdrawal is taxed only on its embedded-gain share, the way a mutual fund redemption actually works.",
    ],
    [
      "Runs in your browser, free, no signup",
      "The simulation, the CSV export and the copy-summary all execute locally. The tool makes no network calls and saves nothing.",
    ],
  ],
  faqs: [
    [
      "How long will my corpus last with an SWP?",
      "The corpus status readout answers this directly — it simulates every month and either reports the full tenure as covered or the exact depletion point, such as \"Runs out in 18y 4m\". How long it lasts depends on the gap between your withdrawal (plus its annual step-up) and the growth earned on a shrinking balance.",
    ],
    [
      "How much can I safely withdraw every month from my corpus?",
      "The Safe Monthly SWP card gives that figure. A 44-step binary search re-runs the entire simulation between zero and an upper bound set to whichever is larger of your full corpus or six times your current monthly withdrawal — so the search range stays wide enough even when the withdrawal you typed is large relative to a small corpus — converging on the highest first-month withdrawal that still survives the tenure you set, with your step-up percentage applied on top of it each year.",
    ],
    [
      "How is tax on an SWP calculated in this tool?",
      "Only on the gain portion of each withdrawal. It tracks your invested cost basis, computes the embedded gain as corpus minus cost basis, applies that ratio to every withdrawal, and taxes the result at the single rate you pick (0–35%). It is a flat approximation — it does not split short-term from long-term capital gains or apply exemptions, so treat it as a planning estimate rather than a tax computation.",
    ],
    [
      "What does the annual SWP step-up do?",
      "It raises your monthly withdrawal once every 12 months by the percentage you set (0–15%, in 0.25% increments). A ₹40,000 withdrawal with a 5% step-up becomes ₹42,000 in year two and ₹44,100 in year three, which is how a payout is kept roughly level in real terms as prices rise.",
    ],
    [
      "Should the withdrawal be at the start or the end of the month?",
      "The toggle changes the order of operations. \"Month Start\" takes the withdrawal before that month's growth is credited; \"Month End\" takes it after. Month End leaves slightly more invested each month, so in this model the corpus lasts marginally longer at the same withdrawal amount.",
    ],
    [
      "What input ranges does this SWP calculator accept?",
      "Initial corpus ₹1,00,000 to ₹10,00,00,000; invested cost basis 0 up to the corpus; monthly withdrawal ₹1,000 to ₹5,00,000; expected annual return 0–20%; annual step-up 0–15%; tenure 1–45 years; tax rate 0–35%. All amounts are displayed in Indian rupees using the en-IN number format.",
    ],
    [
      "Can I export or share the SWP schedule?",
      "Yes. Export CSV downloads swp-yearly-schedule.csv with eight columns per year — year, opening corpus, first monthly SWP, gross withdrawn, estimated tax, net cashflow, returns earned and closing corpus. Copy Summary places a plain-text version of the headline figures on your clipboard.",
    ],
    [
      "Is this SWP calculator free, and is my data sent anywhere?",
      "It is free, needs no signup, and sends nothing anywhere. The simulation runs in JavaScript on your own device, the CSV is generated in-browser from a Blob URL, and none of your inputs are stored or transmitted.",
    ],
  ],
  steps: [
    "Set your initial corpus, invested cost basis and the monthly withdrawal you want to take.",
    "Adjust expected annual return, annual step-up, tenure, tax rate and withdrawal timing — the projection recalculates automatically.",
    "Read the corpus status, safe monthly SWP and return scenarios, then export the yearly schedule as CSV or copy the summary.",
  ],
};

export default seo;
