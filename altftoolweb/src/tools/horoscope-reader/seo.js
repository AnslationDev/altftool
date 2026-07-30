const seo = {
  title: "Daily Horoscope — Free, All 12 Zodiac Signs",
  h1: "Daily Horoscope Reader",
  metaDescription:
    "Free daily, weekly and monthly horoscope for all 12 zodiac signs. Tap your sign for today's reading plus lucky number, color and time — no signup.",
  intro:
    "The Horoscope Reader pulls daily, weekly and monthly sun-sign readings for all 12 zodiac signs from the public horoscope-app-api service, requested live from your browser through a CORS proxy. You tap a sign from the grid — no birth date, birth time, name or account is asked for — and the tool renders that timeframe's reading along with the lucky number, lucky color and lucky time the API returns for the day. It is a sun-sign horoscope feed rather than a natal chart calculator: nothing is computed from an ephemeris, and the text is editorial writing meant for entertainment.",
  useCases: [
    "Checking today's reading for your sign in a couple of taps, without filling in a birth chart form or handing over an email address",
    "Comparing the daily, weekly and monthly outlook for the same sign before planning a week or a month",
    "Looking up a friend's, partner's or colleague's sign — all 12, Aries through Pisces, sit on the same page",
  ],
  benefits: [
    [
      "All 12 signs, three timeframes",
      "Aries through Pisces, each with Daily, Weekly and Monthly views. Switching timeframe re-fetches that sign's reading in place, so you never lose your selection.",
    ],
    [
      "No birth details required",
      "You pick your sign yourself from the grid. The tool never asks for a birth date, birth time, birthplace, name or email — the request it sends carries only the sign name and the timeframe.",
    ],
    [
      "Lucky number, color and time",
      "The daily reading arrives with a lucky number, a lucky color (rendered as an actual color swatch) and a lucky time. The monthly view swaps those for standout days, challenging days and the month covered.",
    ],
    [
      "Free, with one-tap sharing",
      "No account, no paywall and no cap on lookups. The Share button uses your device's native share sheet through the Web Share API, and falls back to copying the reading to your clipboard on browsers that lack it.",
    ],
  ],
  faqs: [
    [
      "what is my horoscope for today",
      "Pick your sign from the 12-sign grid and today's reading loads immediately — the Daily view is selected by default and always requests the current day, not yesterday or tomorrow. Alongside the reading you get that day's lucky number, lucky color and lucky time.",
    ],
    [
      "do I need my birth date or birth time for this horoscope",
      "No. The tool doesn't calculate your sign from a birth date, so you'll need to already know which of the 12 signs is yours — you simply tap it. Nothing about your birth, identity or contact details is collected or sent anywhere.",
    ],
    [
      "can I read weekly and monthly horoscopes too",
      "Yes. After choosing a sign you get three buttons — Daily, Weekly and Monthly — and each one loads a different reading for that same sign. The monthly view also shows standout days, challenging days and the month the forecast covers.",
    ],
    [
      "where do these horoscope predictions come from",
      "They're fetched live from horoscope-app-api, a public horoscope API, routed through a CORS proxy so your browser can read the response. The readings are pre-written editorial text for each sun sign, not something generated from your personal chart — everyone born under the same sign sees the same words that day.",
    ],
    [
      "is this horoscope reader free",
      "Yes — completely free, with no signup, no login and no limit on how many signs or timeframes you check. Nothing on the page is gated.",
    ],
    [
      "are daily horoscopes accurate",
      "Horoscopes are entertainment, not prediction. This tool displays one general reading per sun sign per timeframe, identical for everyone sharing that sign, and it makes no claim to forecast real events. Don't use it as a basis for health, money or relationship decisions.",
    ],
    [
      "why does it say unable to fetch horoscope",
      "That message appears when the request to the external horoscope API fails — usually a dropped connection, an offline device or the upstream API or its CORS proxy being temporarily unavailable. Tap the timeframe button again, or go back and reselect your sign, to retry.",
    ],
    [
      "can I share my horoscope with someone",
      "Yes. The Share button opens your device's native share sheet via the Web Share API with the text \"My [Sign] horoscope: …\" pre-filled. On desktop browsers without share-sheet support, the same text is copied to your clipboard instead.",
    ],
  ],
  steps: [
    "Tap your zodiac sign in the grid of 12 — each is shown with its astrological symbol, from Aries to Pisces.",
    "Choose Daily, Weekly or Monthly; the reading for that timeframe loads for the sign you selected.",
    "Read the forecast and its lucky number, color and time, then hit Share to send it through your device's share sheet or copy it to the clipboard.",
  ],
};

export default seo;
