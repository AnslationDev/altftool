const seo = {
  title: "Pricing Calculator — Selling Price from Cost",
  h1: "Pricing Calculator: Cost, Margin, Markup and Tax",
  metaDescription:
    "Free pricing calculator — enter product, shipping and packaging cost, pick a target margin or markup, add GST or VAT, and get selling price plus profit.",
  intro:
    "The Pricing Calculator derives a retail selling price from four cost inputs — manufacturing, shipping, packaging and other variable costs such as payment fees or marketing — plus a profit target you set as either a margin or a markup. Target Margin divides the cost base by (1 − margin/100), so a 20% margin on a 1,650 cost base returns 2,062.50; Target Markup instead multiplies the cost base by the markup percentage and adds the result. Tax is then applied on top of that pre-tax price at any rate from 0 to 50%, with one-tap 0, 5, 12, 18 and 28% GST presets. Every figure is recomputed from React state in your own browser on each keystroke — the tool makes no network requests, needs no account, and stores nothing.",
  useCases: [
    "Setting a shelf price for a handmade or imported product when you know the landed unit cost and want to keep a fixed share of each sale as profit",
    "Seeing what an 18% GST slab does to the price a customer actually pays once your target margin is already locked in",
    "Comparing a 50% markup against a 50% margin on the same cost base before quoting a wholesale or reseller price",
  ],
  benefits: [
    [
      "Margin and markup are not the same button",
      "On a 1,650 cost base a 50% markup gives 2,475 while a 50% margin gives 3,300. The toggle switches the formula, not just the label.",
    ],
    [
      "Tax sits on the right base",
      "Tax is calculated on the pre-tax selling price and added on top, so the profit you targeted is unchanged whether you apply 0% or 28%.",
    ],
    [
      "Whole price composition at a glance",
      "A stacked bar splits the final price into cost, profit and tax percentages, next to net profit per unit, gross margin, pre-tax price and a line-by-line cost breakdown.",
    ],
    [
      "Nothing leaves your browser",
      "Cost figures live only in page state. There is no upload, no sign-in and no server call anywhere in the tool.",
    ],
  ],
  faqs: [
    [
      "How do you calculate selling price from cost and margin?",
      "Divide the total cost by (1 − margin expressed as a decimal). A 1,650 cost base at a 20% target margin gives 1,650 / 0.8 = 2,062.50, leaving 412.50 profit. Multiplying the cost by 1.20 instead gives 1,980, which is only a 16.7% margin — that is the markup formula, not the margin formula.",
    ],
    [
      "What is the difference between margin and markup?",
      "Margin is profit as a share of the selling price; markup is profit as a share of cost. Starting from the same 1,650 cost base, a 50% markup produces 2,475 (a 33.3% margin), while a 50% margin produces 3,300 (a 100% markup). The calculator has a toggle for each so you never mix them up.",
    ],
    [
      "Does the calculator add GST or VAT on top of my margin?",
      "Yes. Tax is computed on the pre-tax selling price and added, so it does not reduce your profit. At 18% on a 2,062.50 pre-tax price, the tax is 371.25 and the customer pays 2,433.75, while net profit per unit stays 412.50. Presets cover the 0, 5, 12, 18 and 28% slabs, and the slider goes to 50%.",
    ],
    [
      "Can I set a 100% profit margin?",
      "No — the margin slider stops at 99%, and any value of 100% or more falls back to selling at cost, because price = cost / (1 − margin) has no finite answer at 100%. Markup has no such ceiling; that slider runs to 300%.",
    ],
    [
      "Which currency does this pricing calculator use?",
      "Whichever one you enter your costs in. There is a selector for INR, USD, EUR and GBP, but no exchange rates are fetched and no conversion is performed — the arithmetic is identical in every currency, so the selling price and profit come back in the same unit you typed in.",
    ],
    [
      "Is my cost or pricing data sent anywhere?",
      "No. The calculator is a client-side React component: the source contains no fetch calls, no API endpoint and no storage writes, so your figures never reach a server and are not saved. Refreshing the page simply resets it to the defaults of 1,500 product cost, 100 shipping, 50 packaging, a 20% margin and 18% tax.",
    ],
    [
      "How is net profit per unit calculated here?",
      "It is the pre-tax selling price minus your total cost base — manufacturing plus shipping plus packaging plus other variable costs. Tax is left out of profit because the tool treats it as pass-through, collected on top of your price rather than kept.",
    ],
    [
      "Can I include payment gateway fees or ad spend in the price?",
      "Yes, through the Other Variable Costs field, which is added to the cost base alongside shipping and packaging. Note that percentage-based charges — a 2.9% gateway cut, for instance — depend on the final price, so enter your best estimate, read the resulting price, then adjust the amount once.",
    ],
  ],
  steps: [
    "Enter the manufacturing cost, then shipping, packaging and any other variable costs such as payment fees or marketing; the four add up to your total cost base.",
    "Choose Target Margin or Target Markup and set the percentage with the slider or the number box — margin caps at 99%, markup runs to 300%.",
    "Set the tax rate using the 0, 5, 12, 18 or 28% presets (or anything up to 50%) and read the retail selling price, net profit per unit, gross margin and cost breakdown in the results panel.",
  ],
};

export default seo;
