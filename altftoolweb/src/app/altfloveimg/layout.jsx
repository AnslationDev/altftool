import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "./styles/altfloveimg.css";
import SiteHeader from "./components/chrome/SiteHeader";
import SiteFooter from "./components/chrome/SiteFooter";

export async function generateMetadata() {
  return createPageMetadata({
  title: "ALTF Love IMG — Premium Browser Image Tools",
  description:
    "Compress, resize, crop, convert, watermark and edit images right in your browser. 100% private, no uploads, unlimited and free. The premium image toolkit by AltFTool.",
  path: "/altfloveimg",
  keywords: [
    "image tools",
    "compress image",
    "resize image",
    "crop image",
    "convert image",
    "jpg to png",
    "png to jpg",
    "webp converter",
    "watermark image",
    "image editor",
    "meme generator",
    "background remover",
    "browser image processing",
  ],
});
}

export default function AltfLoveImgLayout({ children }) {
  return (
    <div className="ali-scope flex min-h-screen flex-col" style={{ background: "var(--ali-page)" }}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
