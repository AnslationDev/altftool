"use client";

import { useEffect, useState } from "react";
import { isSubscribed, onSubscribed } from "../_lib/leadState";

/**
 * Hides its children once the visitor has subscribed — used to wrap the
 * mid-page email band so a lead isn't asked for the same email twice.
 *
 * Renders children by default (SSR and no-JS users still get the band), then
 * removes them on mount if already subscribed, or live when a subscribe event
 * fires elsewhere on the page (e.g. the hero offer). The band's own submit
 * fires that event with notify=false, so it keeps showing its own success.
 */
export default function HnSubscribedGate({ children }) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (isSubscribed()) setSubscribed(true);
    return onSubscribed(() => setSubscribed(true));
  }, []);

  if (subscribed) return null;
  return children;
}
