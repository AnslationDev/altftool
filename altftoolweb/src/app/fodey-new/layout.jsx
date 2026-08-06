import { AdsProvider } from '@/ads/AdsProvider';
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import {
    MAKER_STUDIO_DESCRIPTION,
    MAKER_STUDIO_TITLE,
    MAKER_STUDIO_TOPICS,
} from "./seo";

import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";
export const metadata = createPageMetadata({
    title: MAKER_STUDIO_TITLE,
    description: MAKER_STUDIO_DESCRIPTION,
    path: '/fodey-new',
    keywords: MAKER_STUDIO_TOPICS,
    pageType: "creative-experience",
});

export default function MakerStudioLayout({ children }) {
    return (
        <AdsProvider>
            <div className="min-h-screen bg-background text-foreground">
                {children}
            </div>
            <AltfLauncher />
        </AdsProvider>
    )
}
