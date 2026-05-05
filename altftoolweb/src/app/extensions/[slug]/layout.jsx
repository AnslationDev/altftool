import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    
    try {
        const docRef = doc(db, "projects", "altftool", "extensions", slug);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
            return { title: "Extension Not Found – AltFTool" };
        }

        const extension = snap.data();
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
