const seo = {
  intro:
    "The Retirement Corpus Calculator works out the lump sum you need on your retirement date and the monthly SIP that gets you there, by inflating today's expenses to your retirement year and then discounting the whole retirement period at the real return — (1 + post-retirement return) ÷ (1 + inflation) − 1 — as an annuity due. It is for anyone who knows roughly what they spend each month and wants a defensible target number rather than a round-figure guess. You also see how much of the target your existing savings already cover, and what a five-year delay in starting would cost.",
  useCases: [
    "You are 30, spend 50,000 a month, and want to know what that same lifestyle costs at 60 after 6% inflation — and what corpus funds it from 60 to 85.",
    "You already hold some savings and want to see what percentage of the required corpus they will grow into on their own, so you only fund the remaining gap with a SIP.",
    "You are deciding whether to start investing now or after a promotion in a few years, and want the extra monthly amount a five-year delay would force on you.",
  ],
  benefits: [
    ["Real-return maths, not a flat multiple", "The corpus is discounted at the inflation-adjusted return rather than a 25× or 30× rule of thumb, so a longer retirement or a lower post-retirement return changes the target properly."],
    ["Separates growth phase from drawdown", "Pre-retirement and post-retirement returns are entered separately, matching a portfolio that de-risks after you stop working."],
    ["Shows the cost of waiting", "It recomputes the SIP as if you started five years later and reports both the higher monthly figure and the extra total invested."],
  ],
  faqs: [
    [
      "How much retirement corpus do I actually need?",
      "Enough to fund your inflation-adjusted annual expenses for every year from retirement to life expectancy, discounted at your real return. The calculator inflates today's monthly expense at your inflation rate — 6% by default — over the years to retirement, annualises it, then values that stream as an annuity due over the retirement period.",
    ],
    [
      "What is the real rate of return and why does it matter?",
      "It is (1 + post-retirement return) ÷ (1 + inflation) − 1, and it is what your money earns after inflation eats into it. With the defaults of an 8% post-retirement return and 6% inflation the real rate is roughly 1.9%, which is why the required corpus is much larger than a simple 8% return would suggest.",
    ],
    [
      "How is the monthly SIP calculated?",
      "Your existing corpus is first compounded forward at the pre-retirement return (12% by default) over the months to retirement; whatever gap remains against the target is divided by the future-value factor of a monthly annuity due at the same rate. If your existing savings already cover the target, the required SIP is zero.",
    ],
    [
      "What if I start investing five years later?",
      "The same gap has to be filled in 60 fewer months, so the required SIP rises sharply and the total amount you invest rises with it — the tool shows both numbers for a five-year delay. These are informational projections based on the rates you enter, not guaranteed outcomes; speak to a licensed financial adviser before acting on them.",
    ],
  ],
};

export default seo;
