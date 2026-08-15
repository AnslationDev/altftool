const seo = {
  title: "Return Window Calculator: Request, Pickup",
  metaDescription:
    "Sets a per-category return window and dates three deadlines - request, pickup, refund - from delivery, dispatch or order date; 12 category presets ship.",
  intro:
    "The Return Window Policy Calculator sets a return window per product category and then converts it into three dated deadlines for a specific order: the last day to raise the return, the last day for pickup, and the last day for the refund to land. It counts from whichever event you nominate as the clock start — delivery, dispatch or order date — in calendar days or working days only, and ships with 12 category defaults such as 30 days for apparel, 10 for consumer electronics and 7 for mobile phones. It is for sellers writing a published returns policy and for buyers checking whether a specific order is still inside the window.",
  useCases: [
    "A customer asks whether they can still return a jacket delivered three weeks ago; you enter the delivery date and the 30-day apparel window and get the exact request-by date and the days remaining.",
    "You are launching a marketplace storefront and need a written returns policy that names a window, a resolution type and an exclusion note for every category you sell.",
    "Your operations team counts working days rather than calendar days, and you need pickup and refund deadlines that skip Saturdays and Sundays.",
  ],
  benefits: [
    ["Three deadlines, not one", "Beyond the request-by date it chains the pickup deadline (5 days by default) and then the refund deadline (7 days after pickup by default), so the customer-facing promise is complete."],
    ["Category defaults that mirror real practice", "12 presets ship with sensible windows and exclusions — hygiene items, perishables, digital keys and made-to-order goods are marked non-returnable rather than given a window."],
    ["Exact calendar arithmetic", "Dates are computed in UTC with leap years handled explicitly, and the working-days mode advances day by day skipping weekends instead of approximating."],
  ],
  faqs: [
    [
      "When does the return window start counting?",
      "Whichever event you choose: date of delivery, date of dispatch, or the date the order was placed. Delivery is the usual anchor and the tool rejects an anchor date that falls before the order date, so the clock cannot start earlier than the purchase.",
    ],
    [
      "How long does a customer legally have to return an online order?",
      "It depends on jurisdiction. In the EU, Article 9 of the Consumer Rights Directive 2011/83/EU gives 14 days to withdraw from a distance contract without giving a reason; in the UK the Consumer Contracts Regulations 2013 give 14 days to cancel, another 14 to send the goods back and 14 more for the refund. India has no statutory cooling-off period for online purchases — the window is contractual, which is why it has to be published. This is general information, not legal advice; check your own obligations with a qualified lawyer.",
    ],
    [
      "Which product categories are normally excluded from returns?",
      "The presets mark four as non-returnable: grocery and fresh food, innerwear, swimwear and hygiene items, digital downloads and licence keys, and personalised or made-to-order goods. You can override any of them, and a category set to a 0-day window is treated as not returnable.",
    ],
    [
      "Can a seller refuse a return once the window has closed?",
      "Not in every case. India's Consumer Protection (E-Commerce) Rules, 2020 bar refusing to take back goods or refund the price where goods are defective, deficient, spurious, or not of the characteristics advertised, regardless of the stated window. The calculator's deadlines describe your published commercial policy, not those overriding obligations.",
    ],
  ],
};

export default seo;
