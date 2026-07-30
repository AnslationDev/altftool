import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "./styles/altfloveimg.css";
import SiteHeader from "./components/chrome/SiteHeader";
import SiteFooter from "./components/chrome/SiteFooter";

export async function generateMetadata() {
  return createPageMetadata({
  title: "ALTF Love IMG — Premium Browser Image Tools",
  description:
    "Compress, resize, crop, convert, watermark and edit JPG, PNG and WebP images right in your browser: free, unlimited and private, with no file ever uploaded.",
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
