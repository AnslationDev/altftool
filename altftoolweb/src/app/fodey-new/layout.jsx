import { AdsProvider } from '@/ads/AdsProvider';
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
    title: 'AltF Maker Studio | Creative Generators',
    description: 'Create vintage newspaper clippings, movie clapper boards, wanted posters, character graphics, and stylized text.',
    path: '/fodey-new',
    keywords: ["creative generators", "newspaper generator", "poster maker", "text generator"],
    pageType: "creative-experience",
});

export default function MakerStudioLayout({ children }) {
    return (
        <AdsProvider>
            <div className="min-h-screen bg-background text-foreground">
                {children}
            </div>
        </AdsProvider>
    )
}
