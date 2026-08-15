const seo = {
  title: "Market Session Clock: NSE, London, New York, Tokyo",
  metaDescription:
    "See whether NSE 09:15-15:30, London 08:00-16:30, New York 09:30-16:00, Tokyo and Hong Kong are inside regular hours right now.",
  steps: [
    "Open the clock — there is no lookup box to fill, because NSE, London, New York, Tokyo and Hong Kong are already configured.",
    "Press Get current result to read each exchange in its own IANA zone at request time.",
    "Every row gives the exchange's local weekday and 24-hour time, Open or Closed, and its session window such as 9:15–15:30.",
  ],
  intro:
    "The Global Market Session Clock shows whether five major stock exchanges are inside their regular trading hours right now — NSE 09:15-15:30, London 08:00-16:30, New York 09:30-16:00, Tokyo 09:00-15:00 and Hong Kong 09:30-16:00, each in its own local time. It reads the current time in the exchange's IANA time zone, marks it Open only on a weekday between the session start and end, and lists the local weekday, clock time and session window side by side. It is for traders, analysts and anyone scheduling calls across markets who needs one screen instead of five world clocks.",
  useCases: [
    "You want to place an order on the New York open from India and need to see, right now, what the local New York clock reads and whether the session has actually started.",
    "You are booking an analyst call and want a window where London and New York are both inside regular hours — the overlap you can see directly from the two session rows.",
    "Daylight saving has just shifted in Europe or the US and you want to confirm how the London and New York open now line up against Tokyo and Hong Kong.",
  ],
  benefits: [
    [
      "Time zones, not fixed offsets",
      "Each exchange is evaluated in its IANA zone (Asia/Kolkata, Europe/London, America/New_York, Asia/Tokyo, Asia/Hong_Kong), so daylight-saving shifts are handled without you adjusting anything.",
    ],
    [
      "Weekends are already excluded",
      "A market is only reported Open on Monday to Friday local time, so a Saturday check does not show a session running because the clock happens to read 10:00.",
    ],
    [
      "Local clock shown next to the status",
      "Every row prints the exchange's own weekday and 24-hour local time alongside its session window, so you can see how far into or away from the session you are.",
    ],
  ],
  faqs: [
    [
      "Which exchanges and hours does it use?",
      "Five: NSE India 09:15-15:30 IST, London 08:00-16:30 UK time, New York 09:30-16:00 Eastern, Tokyo 09:00-15:00 JST and Hong Kong 09:30-16:00 HKT. These are regular continuous-session hours and exclude pre-open, auction and after-hours phases.",
    ],
    [
      "Does it know about market holidays?",
      "No. The status is computed from weekday plus local clock time only, so an exchange closed for a national holiday will still show as Open during its usual window. Check the exchange's own holiday calendar before acting on the status.",
    ],
    [
      "Why does Tokyo show Open during its lunch break?",
      "Because each market is modelled as one continuous window from open to close, and intraday breaks are not encoded — Tokyo and Hong Kong both pause around the middle of the day. Treat the reading as 'inside regular session hours' rather than 'trading is live this second'.",
    ],
    [
      "How is Open decided exactly?",
      "The current time is converted to the exchange's local hour and minute, and the market counts as Open when the local day is Monday to Friday and the local time is at or after the open and strictly before the close. At the closing minute itself the row flips to Closed.",
    ],
  ],
};

export default seo;
