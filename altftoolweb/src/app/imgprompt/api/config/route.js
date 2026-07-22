import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REDIRECT_URL = "https://openart.ai/";

function toMillis(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

/**
 * The admin panel manages redirect links in the site's existing Firestore
 * project under projects/altftool/lookoutLinks. Whatever entry is marked
 * "active" there drives "Copy Prompt"'s destination — no label filtering,
 * since the panel currently manages a single link for this feature. If it
 * ever holds more than one, the most recently updated active entry wins.
 */
async function fetchFromFirestore() {
  try {
    const ref = collection(db, "projects", "altftool", "lookoutLinks");
    const snap = await getDocs(ref);
    const active = snap.docs
      .map((d) => d.data())
      .filter((d) => d?.status === "active" && typeof d?.url === "string" && d.url.trim());

    if (!active.length) return null;

    active.sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
    return active[0].url.trim();
  } catch (err) {
    console.error("[/imgprompt/api/config] Firestore lookup failed, using fallback:", err);
    return null;
  }
}

export async function GET() {
  const firestoreUrl = await fetchFromFirestore();
  const redirectUrl =
    firestoreUrl ||
    process.env.IMGPROMPT_REDIRECT_URL ||
    process.env.NEXT_PUBLIC_OPENART_URL ||
    DEFAULT_REDIRECT_URL;

  return NextResponse.json(
    { redirectUrl },
    { headers: { "Cache-Control": "no-store" } }
  );
}
