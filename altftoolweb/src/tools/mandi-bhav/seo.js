const seo = {
  intro:
    "Mandi Bhav pulls daily crop and vegetable rates from the Government of India's open data portal, data.gov.in, which publishes the AGMARKNET daily mandi price feed reported by market officials across the country. For each record it shows the modal price alongside the minimum and maximum for that commodity in that market, the market and district it came from, and the arrival date the reading belongs to. It is for farmers, traders and buyers who want to compare what a crop is fetching in different mandis before deciding where or when to sell.",
  useCases: [
    "Deciding which of two nearby mandis to take a tomato load to, by filtering to your state and comparing the modal price and the minimum-to-maximum spread market by market.",
    "Checking whether the rate a trader has quoted you for wheat is in line with what the official feed reported for your district on the latest arrival date.",
    "Watching onion or potato rates across several states over a few days to judge whether to hold stock or sell now.",
  ],
  benefits: [
    [
      "Three prices per record, not one headline number",
      "Modal, minimum and maximum are shown together with the spread between them, so you can see whether a market is quoting a tight band or a wide one.",
    ],
    [
      "Filter by state and commodity at the source",
      "The state and crop filters are sent to the data.gov.in query itself, so you get records for what you asked about rather than a page you have to scroll through.",
    ],
    [
      "Every rate is tagged with its market and arrival date",
      "You can tell which mandi a figure came from and which day's arrivals it covers, instead of a single national average with no provenance.",
    ],
  ],
  faqs: [
    [
      "What is the modal price in a mandi rate?",
      "The modal price is the rate at which most of that commodity actually traded in that market that day — the most frequently occurring price, not the average of the minimum and maximum. It is the figure traders normally quote, which is why it is shown as the headline number on each card.",
    ],
    [
      "Where does this mandi data come from?",
      "From the AGMARKNET daily market price dataset published on data.gov.in, India's official open data portal, which market committee officials update daily. AGMARKNET reports rates per quintal, that is per 100 kg.",
    ],
    [
      "How current are the rates?",
      "They are the most recent records the AGMARKNET feed has published, and each card carries the arrival date it belongs to — check that date rather than assuming today's. Reporting lags vary by mandi, and markets closed for a holiday or a weekly off simply will not have a fresh entry.",
    ],
    [
      "Can I look up rates for my own state and crop?",
      "Yes, pick from the state list and type a commodity such as wheat, rice, potato, onion, tomato, cotton, sugarcane or maize, and the query is filtered before the results come back. Up to 100 records are fetched at a time, so narrowing to one state and one crop gives the most useful view.",
    ],
  ],
};

export default seo;
