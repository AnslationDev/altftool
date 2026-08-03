import "./globals.css";
import { Providers } from "./providers/Providers";

import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";
export const metadata = {
  title: "Mockly — Create Ultra Realistic Social Mockups Instantly",
  description:
    "Premium browser-based studio for fake WhatsApp chats, Instagram DMs, tweets, notifications and more. Export pixel-perfect screenshots in seconds.",
  openGraph: {
    title: "Mockly — Ultra Realistic Social Mockups",
    description: "Design pixel-perfect social mockups in your browser.",
    type: "website",
  },
  twitter: { card: "summary" },
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function Layout({ children }) {
  return <Providers>{children}</Providers>;
}
