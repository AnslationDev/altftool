import { createPageMetadata } from "@/platform/seo/generateMetadata";
import CropClient from "./CropClient";

export const metadata = createPageMetadata({
  title: "Crop Image — Free & Social Media Presets",
  description:
    "Crop images freely or with Instagram, Facebook, LinkedIn and YouTube presets. Interactive crop frame, instant download, all in your browser.",
  path: "/altfloveimg/crop",
});

export default function Page() {
  return <CropClient />;
}
