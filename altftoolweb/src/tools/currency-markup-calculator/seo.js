const seo = {
  intro:
    "The mid-market rate is the midpoint between the buy and sell prices of a currency pair on the interbank market, and the gap between it and the rate you are actually offered is the markup — calculated here as (mid − offered) ÷ mid × 100. This tool goes further and converts both the hidden spread and the visible fees back into your starting currency, giving one true all-in cost percentage that lets you compare a provider with a good rate and a big fee against one with the reverse. It also derives the mid from a dealer's bid and ask, and ranks competing quotes by what actually arrives.",
  useCases: [
    "Check how much a bank's 'no fee' transfer really costs once the rate spread is counted.",
    "Compare three transfer providers on a 1,000 conversion when their fees are structured differently.",
    "Decide whether to accept dynamic currency conversion at a foreign card terminal.",
  ],
  benefits: [
    ["One comparable number", "Rate markup and explicit fees are combined into a single all-in cost percentage in your own currency."],
    ["Works with either quote direction", "Enter rates as 1 GBP = 1.17 EUR or 1 EUR = 0.8547 GBP and get the same answer."],
    ["Bid/ask to mid", "Derives the mid-market rate and the dealer's spread from a two-way price."],
  ],
  faqs: [
    [
      "What is the mid-market exchange rate?",
      "It is the midpoint between the bid and ask prices for a currency pair on the wholesale market — the rate you see on search engines and financial data sites. It is a reference price, not something available at retail, so every consumer conversion happens at some margin away from it.",
    ],
    [
      "How do I calculate the markup on an exchange rate?",
      "Subtract the offered rate from the mid-market rate, divide by the mid, and multiply by 100. If the mid is 1.1700 and you are offered 1.1466, the markup is 0.0234 ÷ 1.1700 = 2.0%.",
    ],
    [
      "Is a zero-fee transfer actually cheaper?",
      "Not necessarily. A provider charging no visible fee usually recovers more in the rate, so compare the amount that arrives rather than the fee line. On a 1,000 transfer a 2% rate markup costs 20 — far more than a 5 flat fee at a rate close to mid.",
    ],
    [
      "Should I accept dynamic currency conversion when paying abroad?",
      "Generally no. Choosing to be billed in your home currency at the terminal hands the conversion to the merchant's provider, and those markups are commonly in the 4% to 12% range — much wider than the rate your own card network would apply. Pay in the local currency instead.",
    ],
  ],
};

export default seo;
