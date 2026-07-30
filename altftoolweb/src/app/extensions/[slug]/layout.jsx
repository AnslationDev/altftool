import { createPageMetadata } from "@/platform/seo/generateMetadata";
// The Firestore read moved to ./extensionRecord so page.jsx can build the
// extension's JSON-LD from the same cached record instead of repeating it.
import { getExtensionRecord } from "./extensionRecord";

export async function generateMetadata({ params }) {
    const { slug } = await params;

    try {
        const extension = await getExtensionRecord(slug);
        if (!extension) {
            // Same self-canonical rule as the catch branch below: a bare
            // {title, robots} object shipped no canonical, description or
            // OG/Twitter tags at all, so route it through createPageMetadata.
            return createPageMetadata({
                title: "Extension Not Found – AltFTool",
                description:
                    "This Chrome extension is not available on AltFTool. Browse the extensions hub for curated browser add-ons that speed up everyday work.",
                path: `/extensions/${slug}`,
                noindex: true,
            });
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
        // Stay self-canonical. Pointing this at /extensions while also sending
        // noindex would tell Google to consolidate the URL onto the hub and
        // carry the noindex across — dropping the hub itself out of the index.
        return createPageMetadata({
            title: "Extensions – AltFTool",
            description: "This extension could not be loaded right now. Browse the AltFTool extensions hub for curated browser add-ons that speed up everyday work.",
            path: `/extensions/${slug}`,
            noindex: true,
        });
    }
}

export default function ExtensionLayout({ children }) {
    return <>{children}</>;
}
