import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { AccountClient } from "./AccountClient";

export const metadata = createPageMetadata({
  title: "My Account - AltFTool",
  description: "Manage your AltFTool account, favorites, and preferences.",
  path: "/account",
  noindex: true,
});

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <AccountClient />
    </main>
  );
}
