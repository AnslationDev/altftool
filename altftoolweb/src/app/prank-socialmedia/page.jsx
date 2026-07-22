import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Mockly – Ultra Realistic Social Media Mockup Generator",
    description:
      "Create pixel-perfect WhatsApp chats, Instagram DMs, tweets, and notification screen mockups right in your browser and export them as PNG in one click.",
    path: "/prank-socialmedia",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
