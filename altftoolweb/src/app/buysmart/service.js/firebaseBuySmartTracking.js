"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  cleanText,
  getBuySmartBrandSlug,
  normalizeBuySmartCategory,
} from "@altftool/core/buysmart";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";

const ANALYTICS_REF = doc(db, ...buySmartDocPath("analytics"));
const MAX_EVENTS = 250;

function safeEventType(value) {
  const eventType = cleanText(value).toLowerCase();
  return ["reveal", "copy", "outbound"].includes(eventType) ? eventType : "reveal";
}

export async function recordBuySmartEvent(offer = {}, eventType = "reveal") {
  if (typeof window === "undefined") return null;

  const normalizedOffer = normalizeBuySmartCategory(offer);
  const slug = getBuySmartBrandSlug(normalizedOffer);
  const normalizedEventType = safeEventType(eventType);
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    brandSlug: slug,
    brandTitle: normalizedOffer.title,
    category: normalizedOffer.category,
    eventType: normalizedEventType,
    href: normalizedOffer.link === "#" ? "" : normalizedOffer.link,
    offerType: normalizedOffer.offerType,
    saving: normalizedOffer.discount || normalizedOffer.cashback || normalizedOffer.points || "",
    ts: Date.now(),
  };

  try {
    const snap = await getDoc(ANALYTICS_REF);
    const data = snap.exists() ? snap.data() : {};
    const existingEvents = Array.isArray(data.events) ? data.events : [];
    const existingCounters = data.counters && typeof data.counters === "object" ? data.counters : {};
    const brandCounters =
      existingCounters[slug] && typeof existingCounters[slug] === "object"
        ? existingCounters[slug]
        : {};

    await setDoc(
      ANALYTICS_REF,
      {
        counters: {
          ...existingCounters,
          [slug]: {
            ...brandCounters,
            [normalizedEventType]: Number(brandCounters[normalizedEventType] || 0) + 1,
          },
        },
        events: [...existingEvents, event].slice(-MAX_EVENTS),
        updatedAt: Date.now(),
      },
      { merge: true },
    );

    return event.id;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug("BuySmart analytics write skipped", error);
    }
    return null;
  }
}
