import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "./styles/altfloveimg.css";
import SiteHeader from "./components/chrome/SiteHeader";
import SiteFooter from "./components/chrome/SiteFooter";

// A layout's title.template applies to CHILD segments, not to the segment it
// sits in — so this object governs /altfloveimg/compress, /altfloveimg/crop and
// the other 11 tool pages, while /altfloveimg itself still resolves against the
// root layout's "%s | AltFTool".
//
// It returned a plain string, which replaces the root layout's {default,
// template} wholesale and leaves child segments with no template at all. That
// is why every tool page under here served an unbranded title live — "Compress
// Image — JPG, PNG & WEBP", "JPG to PNG Converter" — while every other section
// of the site carries the brand. Restoring the template puts it back; the
// longest child title is 42 characters, so all 13 stay inside 60 with the
// 11-character suffix.
const BRANDED_TITLE = {
  default: "ALTF Love IMG — Premium Browser Image Tools",
  template: "%s | AltFTool",
};

export async function generateMetadata() {
  const metadata = await createPageMetadata({
    title: BRANDED_TITLE.default,
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

  return { ...metadata, title: BRANDED_TITLE };
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
