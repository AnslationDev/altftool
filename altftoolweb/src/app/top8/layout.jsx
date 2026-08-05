import "./top8.css";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

const DESCRIPTION =
  "Independent rankings for curious people. Researched deeply, edited carefully, limited to eight.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "TOP8 — Find less. Choose better.",
    description: DESCRIPTION,
    path: "/top8",
    noindex: true,
    follow: true,
  });
}

export default function Top8Layout({ children }) {
  return children;
}
