import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Animal Hub Preview Unavailable",
    description:
      "This animal encyclopedia preview is unavailable while media licenses, attribution, and editorial sources are verified.",
    path: "/animalhub",
    noindex: true,
    follow: false,
  });
}

/**
 * Preserve the imported implementation for remediation without compiling or
 * serving its unverified media corpus. The proxy also emits a hard 404; this
 * layout guard protects runtimes that do not execute the request proxy.
 */
export default function AnimalHubLayout() {
  notFound();
}
