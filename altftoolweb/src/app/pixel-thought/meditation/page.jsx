import PixelThoughtMeditation from './components/PixelThoughtMeditation'
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    // This route renders the exact same <PixelThoughtMeditation /> component as
    // /pixel-thought — same markup, same H1, no unique content. Both were
    // self-canonical, so the site was competing with itself on the one query it
    // already fails to convert. src/app/sitemap.js lists THIS url (line 101)
    // and not /pixel-thought, yet GSC shows /pixel-thought with 324 impressions
    // and this one with none, so search has already picked the parent.
    // Canonicalising here follows that choice instead of fighting it; title and
    // description deliberately match the parent, as a duplicate's should.
    title: "60-Second Meditation to Let a Worry Go",
    description:
      "Type the worry that's on your mind, watch it shrink into a star and disappear over 60 seconds. Free, no signup, nothing you type leaves the page.",
    path: "/pixel-thought/meditation",
    canonical: "/pixel-thought",
  });
}

export default function MeditationPage() {
  return <PixelThoughtMeditation />
}
