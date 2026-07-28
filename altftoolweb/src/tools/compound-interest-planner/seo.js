const seo = {
  title: "Compound Interest Calculator with Yearly Top-Ups",
  h1: "Compound Interest Planner — Top-Ups, Tax and Inflation",
  metaDescription:
    "Compound interest calculator with yearly top-ups, monthly-to-yearly compounding, tax drag and inflation-adjusted value. Free, in-browser, CSV export.",
  intro:
    "The Compound Interest Planner projects a lumpsum plus yearly top-ups forward one year at a time, growing the balance with the standard periodic formula corpus × (1 + r/n)^n — where n is 12 for monthly, 4 for quarterly, 2 for half-yearly or 1 for yearly compounding. Each year it subtracts your tax rate from that year's interest before reinvesting the remainder, then discounts the running corpus by (1 + inflation)^year to show buying power in today's money, and plots the result as Recharts area, bar and donut charts. Every figure is computed in your browser from the numbers you type — no server call, no upload, no signup — and the CSV export is generated locally as a Blob. Results are estimates based on the assumptions you enter, not a forecast.",
  useCases: [
    "Compare how monthly, quarterly, half-yearly and yearly compounding change the same 15-year lumpsum",
    "See what a recurring yearly top-up adds on top of a starting corpus, and whether adding it in January or December matters",
    "Check what a projected corpus is worth in today's money after inflation, and how much annual tax eats from the compounding",
  ],
  benefits: [
    [
      "Tax and inflation are modelled, not ignored",
      "Most compound interest calculators show a gross number. This one deducts your tax rate from each year's interest before it compounds, and shows a separate inflation-adjusted 'real value' line alongside the nominal corpus.",
    ],
    [
      "Reinvest or withdraw, one toggle apart",
      "Switch 'Reinvest yearly gains' off and the corpus stops compounding — interest is tracked as withdrawn income instead, so you can see the gap between a growth plan and an income plan on the same inputs.",
    ],
    [
      "A year-by-year schedule you can keep",
      "Export CSV writes compound-interest-plan.csv with invested capital, corpus value, net interest, tax, inflation-adjusted value and withdrawn interest for every year. Copy Summary puts the headline numbers on your clipboard as plain text.",
    ],
    [
      "Runs entirely on your device",
      "The whole projection is a single client-side function. No account, no network request, and none of the amounts you type are transmitted or stored anywhere.",
    ],
  ],
  faqs: [
    [
      "How do you calculate compound interest with yearly contributions?",
      "Each year the planner multiplies the balance by (1 + r/n)^n, where r is your annual return and n is the number of compounding periods per year — 12 monthly, 4 quarterly, 2 half-yearly, 1 yearly. Your yearly top-up is added either before that growth (start of year) or after it (end of year), which you choose in the Top-up Timing dropdown, so a start-of-year top-up earns a full year of compounding and an end-of-year one does not.",
    ],
    [
      "Does this compound interest calculator account for tax?",
      "Yes — tax is applied every year, not once at the end. The tool computes that year's gross interest, multiplies it by your tax rate (0-60%), and only the net interest is reinvested. The running total appears as 'Estimated Tax' and as its own slice in the Corpus Split donut. It is a flat annual drag model, not a simulation of any specific tax regime, holding period or exemption.",
    ],
    [
      "What does inflation-adjusted value mean in this planner?",
      "It is the corpus divided by (1 + inflation)^year — what the future amount would buy at today's prices. The default is 6% and the field accepts 0-30%. It appears as the purple 'Real Value' area under the nominal corpus line in the growth chart and as the Real Value metric card.",
    ],
    [
      "Why is the effective CAGR lower than the return rate I entered?",
      "Because CAGR here is ((final corpus + withdrawn interest) / total invested)^(1/years) − 1, and total invested counts every top-up at full value no matter which year it went in. A top-up made in year 14 only compounds for one year but is divided across the whole horizon, and annual tax reduces the growth further. It is an annualised money multiple, not an XIRR that weights each contribution by its date.",
    ],
    [
      "What happens if I turn off 'Reinvest yearly gains'?",
      "The corpus resets to its pre-growth balance each year and that year's net interest is recorded as withdrawn income instead. The balance then only grows through your yearly top-ups, the Wealth Gain card switches to showing total interest paid out, and 'Withdrawn Interest' accumulates across the schedule.",
    ],
    [
      "Can I export the year-by-year compound interest schedule?",
      "Yes. Export CSV downloads compound-interest-plan.csv with seven columns — Year, Invested, Corpus Value, Net Interest, Tax, Inflation Adjusted Value, Withdrawn Interest — one row per year plus a Year 0 starting row, all values rounded to whole rupees. The file is built in your browser with a Blob and never passes through a server.",
    ],
    [
      "Is the Compound Interest Planner free, and are my figures uploaded?",
      "It is free with no signup, and nothing you enter leaves your device. The projection is a single JavaScript function that runs in the page and recalculates on every keystroke; there are no API calls, no analytics on your inputs and no saved sessions. Reload the page and the figures are gone.",
    ],
    [
      "What currency and input limits does it use?",
      "Amounts are formatted in Indian rupees using Intl.NumberFormat with the en-IN locale. Limits are 1-60 years, expected return 0-60% (in 0.05% steps), tax 0-60%, inflation 0-30% (in 0.1% steps), and up to ₹10 crore each for the lumpsum principal and the yearly top-up. The bundled sample loads ₹5,00,000 at 12% for 15 years with a ₹50,000 yearly top-up, monthly compounding, 10% tax and 6% inflation.",
    ],
  ],
  steps: [
    "Enter your lumpsum principal, yearly top-up, expected annual return and number of years, then pick monthly, quarterly, half-yearly or yearly compounding and whether the top-up lands at the start or end of each year.",
    "Set your tax rate and inflation rate, and toggle 'Reinvest yearly gains' on or off — the metric cards, growth chart, year-wise interest bars and corpus split all recalculate as you type.",
    "Read the final corpus, inflation-adjusted real value, effective CAGR and estimated tax, then use Copy Summary for a plain-text recap or Export CSV for the full year-by-year schedule.",
  ],
};

export default seo;
