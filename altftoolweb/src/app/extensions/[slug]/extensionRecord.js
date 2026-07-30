/**
 * Server-side read of a single extension record.
 *
 * This lived inside layout.jsx, where only generateMetadata could reach it.
 * page.jsx needs the same record to emit the SoftwareApplication entity — the
 * detail view itself is a client component that fetches from Firestore after
 * hydration, so nothing about the extension exists in the server HTML. Both
 * callers now share this module, which means they also share the TTL cache and
 * the 5-minute revalidate window: one read, not two.
 *
 * Behaviour is unchanged from the layout copy — missing env vars and non-200
 * responses throw, a 404 resolves to null.
 */
import { createTtlCache } from "@altftool/core/cache";
import { normalizeExtension } from "@altftool/core/firebaseContent";

const metadataCache = createTtlCache({ ttlMs: 300000, maxEntries: 120 });
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function firestoreValueToJs(value) {
    if (!value) return undefined;
    if ("stringValue" in value) return value.stringValue;
    if ("integerValue" in value) return Number(value.integerValue);
    if ("doubleValue" in value) return Number(value.doubleValue);
    if ("booleanValue" in value) return Boolean(value.booleanValue);
    if ("timestampValue" in value) return value.timestampValue;
    if ("nullValue" in value) return null;
    if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
    if ("mapValue" in value) {
        return Object.fromEntries(
            Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
                key,
                firestoreValueToJs(nestedValue),
            ]),
        );
    }
    return undefined;
}

function decodeFirestoreFields(fields = {}) {
    return Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, firestoreValueToJs(value)]),
    );
}

export async function getExtensionRecord(slug) {
    if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
        throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY/NEXT_PUBLIC_FIREBASE_PROJECT_ID env vars");
    }
    return metadataCache.getOrSet(`extension-meta:${slug}`, async () => {
        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/altftool/extensions/${encodeURIComponent(slug)}?key=${FIREBASE_API_KEY}`,
            { next: { revalidate: 300 } },
        );

        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`Extension metadata read failed: ${response.status}`);

        const payload = await response.json();
        return normalizeExtension(decodeFirestoreFields(payload.fields || {}), slug);
    }, 300000);
}
