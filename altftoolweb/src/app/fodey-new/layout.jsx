export const metadata = {
    title: 'AltF Maker Studio | Creative Generators',
    description: 'Create vintage newspaper clippings, movie clapper boards, wanted posters, character graphics, and stylized text.',
    alternates: { canonical: '/fodey-new' },
}

import { AdsProvider } from '@/ads/AdsProvider';

export default function MakerStudioLayout({ children }) {
    return (
        <AdsProvider>
            <div className="min-h-screen bg-background text-foreground">
                {children}
            </div>
        </AdsProvider>
    )
}
