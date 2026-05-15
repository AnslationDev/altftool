import { createTtlCache } from "@altftool/core/cache";
import { normalizeExtension } from "@altftool/core/firebaseContent";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

const metadataCache = createTtlCache({ ttlMs: 300000, maxEntries: 120 });
const FIREBASE_API_KEY =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";

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

async function getExtensionMetadata(slug) {
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

export async function generateMetadata({ params }) {
    const { slug } = await params;
    
    try {
        const extension = await getExtensionMetadata(slug);
        if (!extension) {
            return {
                title: "Extension Not Found – AltFTool",
                robots: { index: false, follow: true },
            };
        }

        return createPageMetadata({
            title: `${extension.name} – Chrome Extension`,
            description: extension.description || `Download and explore the ${extension.name} extension on AltFTool.`,
            path: `/extensions/${extension.slug || slug}`,
            image: extension.image,
            keywords: [
                extension.name,
                `${extension.name} extension`,
                extension.category,
                "Chrome extension",
            ],
        });
    } catch (e) {
        return createPageMetadata({
            title: "Extensions – AltFTool",
            description: "Explore useful Chrome extensions curated by AltFTool.",
            path: "/extensions",
        });
    }
}

export default function ExtensionLayout({ children }) {
    return <>{children}</>;
}
