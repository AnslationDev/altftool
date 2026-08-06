import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AltF Pulse Editorial Preview",
  description: "AltF Pulse is paused while its editorial sourcing and publishing workflow is rebuilt.",
  path: "/buzzfeed",
  noindex: true,
  follow: true,
  pageType: "editorial",
});

export default function AltFPulseLayout({ children }) {
  return children;
}
