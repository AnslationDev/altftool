// src/app/tradeon/lib/marketHours.js
// Lightweight market-session logic per asset class (UTC-based). Drives the
// "Market Open / Closed / Pre-Market" indicator and whether live streaming
// should be active. Crypto & forex are effectively 24/5-7; equities follow a
// simplified US cash session.

export function getMarketStatus(assetClass, now = new Date()) {
  const day = now.getUTCDay(); // 0 Sun .. 6 Sat
  const h = now.getUTCHours() + now.getUTCMinutes() / 60;
  const weekday = day >= 1 && day <= 5;

  if (assetClass === "crypto") {
    return { status: "open", label: "Market Open", streaming: true, is24h: true, session: "24/7" };
  }

  if (assetClass === "forex") {
    // Opens Sun 22:00 UTC, closes Fri 22:00 UTC.
    const closed = day === 6 || (day === 0 && h < 22) || (day === 5 && h >= 22);
    return closed
      ? { status: "closed", label: "Market Closed", streaming: false, session: "FX" }
      : { status: "open", label: "Market Open", streaming: true, session: "FX 24/5" };
  }

  if (assetClass === "commodities") {
    // Nearly 24h on weekdays with a short daily break.
    const open = weekday && !(h >= 21 && h < 22);
    return open
      ? { status: "open", label: "Market Open", streaming: true, session: "Futures" }
      : { status: "closed", label: "Market Closed", streaming: false, session: "Futures" };
  }

  // stocks / indices / etf — US cash session (13:30–20:00 UTC), pre 08:00–13:30.
  if (!weekday) return { status: "closed", label: "Market Closed", streaming: false, session: "Cash" };
  if (h >= 13.5 && h < 20) return { status: "open", label: "Market Open", streaming: true, session: "Regular" };
  if (h >= 8 && h < 13.5) return { status: "pre", label: "Pre-Market", streaming: true, session: "Pre-Market" };
  if (h >= 20 && h < 24) return { status: "after", label: "After-Hours", streaming: true, session: "After-Hours" };
  return { status: "closed", label: "Market Closed", streaming: false, session: "Cash" };
}

export const STATUS_COLOR = {
  open: "var(--tdn-up)",
  pre: "var(--tdn-amber)",
  after: "var(--tdn-amber)",
  closed: "var(--tdn-faint)",
};
