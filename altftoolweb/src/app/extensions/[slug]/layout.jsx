import { doc, getDoc } from "firebase/firestore";
import { createTtlCache } from "@altftool/core/cache";
import { normalizeExtension } from "@altftool/core/firebaseContent";
import { ALTFT_EXTENSIONS_COLLECTION_PATH } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";

const metadataCache = createTtlCache({ ttlMs: 300000, maxEntries: 120 });

async function getExtensionMetadata(slug) {
    return metadataCache.getOrSet(`extension-meta:${slug}`, async () => {
        const docRef = doc(db, ...ALTFT_EXTENSIONS_COLLECTION_PATH, slug);
        const snap = await getDoc(docRef);
        return snap.exists() ? normalizeExtension(snap.data(), slug) : null;
    }, 300000);
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    
    try {
        const extension = await getExtensionMetadata(slug);
        if (!extension) {
            return { title: "Extension Not Found – AltFTool" };
        }

        return {
            title: `${extension.name} – Chrome Extension`,
            description: extension.description || `Download and explore the ${extension.name} extension on AltFTool.`,
        };
    } catch (e) {
        return { title: "Extensions – AltFTool" };
    }
}

export default function ExtensionLayout({ children }) {
    return <>{children}</>;
}
