const seo = {
  intro:
    "The Markup Calculator applies a markup percentage to a cost to give the selling price, using price = cost x (1 + markup / 100), and reports the resulting cash profit and the gross margin that same price implies. A cost of 60 with a 40 percent markup produces a price of 84, a profit of 24 and a margin of 28.57 percent. It is for retailers, tradespeople and freelancers who price from cost upward and want to see what the margin actually works out to.",
  useCases: [
    "Pricing stock you have just bought in at a fixed cost, by applying your standard shop markup and seeing the shelf price and the profit per unit.",
    "Quoting a job where you add a set percentage on top of materials, and needing the total figure to put on the estimate.",
    "Checking what margin your usual markup really delivers before agreeing a discount, since a 40 percent markup is only a 28.57 percent margin and there is less room than it looks.",
  ],
  benefits: [
    [
      "Price, profit and margin from one input",
      "You enter cost and markup, and get the selling price plus both the cash profit and the margin that price produces.",
    ],
    [
      "Shows the markup-to-margin gap",
      "The margin figure sits next to the price, which is where people usually discover the two percentages are not the same number.",
    ],
    [
      "Works with any markup level",
      "The formula holds for a 5 percent trade uplift or a 300 percent retail multiple, so the same tool covers wholesale and retail pricing.",
    ],
  ],
  faqs: [
    [
      "How do I calculate selling price from cost and markup?",
      "Multiply the cost by (1 + markup percentage divided by 100). A cost of 60 with a 40 percent markup gives 60 x 1.40 = 84, and the profit is the 24 difference.",
    ],
    [
      "Is markup the same as margin?",
      "No. Markup is profit as a percentage of cost, margin is profit as a percentage of the selling price, and markup is always the larger number. A 40 percent markup equals a 28.57 percent margin, a 50 percent markup equals a 33.33 percent margin, and a 100 percent markup equals a 50 percent margin.",
    ],
    [
      "What markup should I use?",
      "It varies widely by trade, so base it on what your sector and your own overheads require rather than a universal figure — keystone pricing, meaning a 100 percent markup that doubles cost, is a common retail convention but not a rule. Remember the result here is gross: rent, wages and tax still come out of it, and an accountant should confirm your net position.",
    ],
    [
      "How do I convert a margin target into a markup?",
      "Divide the margin by (100 minus the margin) and multiply by 100. To hit a 30 percent margin you need a markup of 30 / 70 x 100, which is about 42.86 percent, and you can confirm it by entering that markup here and reading the margin back.",
    ],
  ],
};

export default seo;
