import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs } from "../components/primitives";
import ChatClient from "./ChatClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "../bazaar.css";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "AltF Bazaar", path: "/bazaar" },
  { name: "Chats", path: "/bazaar/chat" },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Chats on AltF Bazaar",
    description:
      "Your AltF Bazaar inbox: message sellers about the ads you are interested in and keep every conversation in one place.",
    path: "/bazaar/chat",
    noindex: true,
  });
}

export default function ChatPage() {
  return (
    <BazaarShell>
      <div className="section-container">
        <Breadcrumbs items={CRUMBS} />
        <header className="bzr-section-head">
          <h1 className="bzr-section-title">Chats</h1>
        </header>
        <ChatClient />
      </div>
    </BazaarShell>
  );
}
