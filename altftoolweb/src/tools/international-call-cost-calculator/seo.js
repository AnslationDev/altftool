const seo = {
  intro:
    "This calculator prices the same volume of calls home four different ways — pay-per-minute roaming, a local prepaid SIM, VoIP over mobile data and an international calling pack — and ranks them by total trip cost and effective cost per minute. VoIP is costed from real data consumption at 0.5 MB per minute for voice and 5 MB per minute for video, so it competes on the price of a gigabyte rather than a made-up rate. Enter every price in a single currency; nothing is converted behind your back.",
  useCases: [
    "Deciding whether a $10 international calling pack beats paying $1.79 a minute in roaming for a ten-day trip",
    "Checking if a local SIM's up-front cost pays for itself over the number of minutes you will actually talk",
    "Showing a family member abroad that WhatsApp calling on a data plan costs cents where carrier roaming costs hundreds",
  ],
  benefits: [
    [
      "Four options, one basis",
      "The same minutes and call count are priced across all four routes, so the totals are directly comparable.",
    ],
    [
      "VoIP costed honestly",
      "Data-based calling is priced from megabytes consumed and your real price per GB, including the share of minutes made on Wi-Fi.",
    ],
    [
      "Break-even visible",
      "Up-front SIM costs and pack overage are separated from per-minute rates, so you can see where each option stops being cheap.",
    ],
  ],
  faqs: [
    [
      "Is it cheaper to use WhatsApp or to make a normal call abroad?",
      "Almost always WhatsApp, unless data is extraordinarily expensive. A voice call over VoIP uses about 0.5 MB per minute, so 100 minutes consumes roughly 50 MB — a few cents on most data plans, against carrier roaming rates that commonly run above $1 per minute.",
    ],
    [
      "How much does calling home cost while roaming in the EU?",
      "Inside the EU/EEA, 'Roam Like At Home' rules in force since 15 June 2017 mean you pay your normal domestic rate for calls, texts and data while travelling. Separately, calling from your home country to another EU country is capped at €0.19 per minute excluding VAT under EU Regulation 2018/1971.",
    ],
    [
      "When is a local SIM worth buying?",
      "When the up-front SIM cost divided by your expected minutes falls below the roaming rate you would otherwise pay. A €15 SIM at €0.02 a minute beats €0.19-a-minute roaming after about 88 minutes; below that, the roaming rate wins. This tool computes that comparison for the exact minutes you enter.",
    ],
    [
      "Does a connection fee per call really matter?",
      "It matters most for people who make many short calls. Ten one-minute calls a day for a week at a $0.50 connection fee adds $35 regardless of the per-minute rate, which can make a pack or VoIP the better choice even when the headline per-minute rate looks fine.",
    ],
  ],
};

export default seo;
