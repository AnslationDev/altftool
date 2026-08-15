const seo = {
  title: "Compound Interest Calculator with Year-by-Year",
  metaDescription:
    "A = P(1+r/n)^nt with daily, monthly, quarterly, half-yearly or yearly compounding - maturity amount, interest earned and a year-wise balance table in ₹.",
  intro:
    "This compound interest calculator applies the standard formula A = P(1 + r/n)^(nt), where n is 365 for daily, 12 for monthly, 4 for quarterly, 2 for half-yearly and 1 for yearly compounding, and reports the maturity amount, the interest portion and a year-by-year balance table in rupees. Savers comparing a fixed deposit against a recurring alternative can see exactly how much of the final figure is interest rather than principal. It models a single lump sum with no further deposits and no tax deducted.",
  useCases: [
    "Two banks quote the same 7.5% on a fixed deposit but one compounds quarterly and the other yearly, and you want the rupee difference on a ₹5 lakh deposit before choosing.",
    "You are explaining to a teenager why money left alone for 10 years grows faster than money left for 5, using the year-by-year table rather than a slogan.",
    "A relative offers to hold your savings at a flat annual rate and you need the compounded equivalent to judge whether the offer is actually competitive.",
  ],
  benefits: [
    [
      "Five compounding frequencies, same inputs",
      "Switching between daily, monthly, quarterly, half-yearly and yearly re-runs the same principal and rate, so the frequency effect is isolated instead of guessed at.",
    ],
    [
      "Interest split out from principal",
      "The result separates total maturity value from the interest earned, which is the number that matters when you are comparing against an alternative use of the money.",
    ],
    [
      "Year-by-year balances",
      "Every year from one to the end of the term is listed with its closing balance and cumulative interest, so you can see the point where interest overtakes what you put in.",
    ],
  ],
  faqs: [
    [
      "what is the compound interest formula used here",
      "A = P(1 + r/n)^(nt): principal times one plus the annual rate divided by compounding periods per year, raised to periods per year times the number of years. The rate you type as 8 is used as 0.08, and n is set by the frequency you pick.",
    ],
    [
      "how much difference does compounding frequency actually make",
      "Less than most people expect at ordinary rates. ₹1,00,000 at 8% for 10 years matures at about ₹2,15,892 compounded yearly and about ₹2,22,535 compounded daily — roughly ₹6,600, or a little over 3%, between the two extremes.",
    ],
    [
      "does this calculator include monthly deposits or SIP contributions",
      "No. It compounds one opening principal for the whole term and adds nothing along the way, which matches a fixed deposit or a one-time investment. For a monthly contribution plan you need a recurring deposit or SIP calculation instead, since those use a future-value-of-annuity formula.",
    ],
    [
      "is the interest shown taxable",
      "The figures are gross, with no tax, TDS or inflation deducted, so your actual credit will be lower. Interest on bank deposits is generally taxable as income in India, and banks deduct TDS above the prescribed annual threshold — check the current limit and your own slab with a tax professional before relying on the net figure.",
    ],
  ],
};

export default seo;
