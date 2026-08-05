import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs } from "../components/primitives";
import { T } from "../i18n/T";
import PostAdWizard from "./PostAdWizard";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "../bazaar.css";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "AltF Bazaar", path: "/bazaar" },
  { name: "Post an ad", path: "/bazaar/post" },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Post a free ad on AltF Bazaar",
    description:
      "List an item on AltF Bazaar in six steps: pick a category, add details and photos, set a price, choose your locality and post. Demo marketplace — ads stay in your browser.",
    path: "/bazaar/post",
    // Personal surface: nothing here belongs in an index.
    noindex: true,
    keywords: ["post free ad", "sell online", "classifieds India", "AltF Bazaar"],
  });
}

export default function PostAdPage() {
  return (
    <BazaarShell>
      <div className="section-container">
        <Breadcrumbs items={CRUMBS} />
        <header className="bzr-section-head">
          <h1 className="bzr-section-title">
            <T id="post.heading" fallback="Post an ad" />
          </h1>
        </header>
        <PostAdWizard />
      </div>
    </BazaarShell>
  );
}
