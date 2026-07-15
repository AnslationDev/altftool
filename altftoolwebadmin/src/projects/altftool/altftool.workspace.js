// ALTFTool registers itself with the Workspace Registry.
// Applications are defined BY this project — the registry assumes nothing.
// Module keys mirror real admin route segments (/altftool/<module>) so activity
// classifies correctly. Sections/features can be enriched incrementally.
import { registerProject } from "@/lib/workspace/registry";

registerProject({
  id: "altftool",
  name: "AltFTool",
  applications: {
    "admin-panel": {
      label: "Admin Panel",
      default: true,
      modules: {
        ads: { label: "Ads" },
        blogs: { label: "Blogs" },
        buysmart: { label: "BuySmart" },
        deals: { label: "Deals" },
        extensions: { label: "Browser Extensions" },
        images: { label: "Images" },
        pintrest: { label: "Pinterest" },
        salelocator: { label: "Sale Locator" },
        seo: { label: "SEO" },
        trendingVideos: { label: "Trending Videos" },
        consumerrating: { label: "Consumer Rating" },
        academy: { label: "Academy" },
        sketchflow: { label: "SketchFlow" },
        tripfindbox: { label: "TripFindBox" },
        pranx: { label: "Pranx" },
        pranksocialmedia: { label: "Prank Social Media" },
        dynamic: { label: "Dynamic Routes" },
      },
    },
    "public-website": {
      label: "Public Website",
      modules: {
        home: { label: "Home" },
        search: { label: "Search" },
        blog: { label: "Blog" },
        categories: { label: "Categories" },
        "tool-pages": { label: "Tool Pages" },
        "landing-pages": { label: "Landing Pages" },
        tools: {
          label: "Tools",
          sections: {
            "ai-tools": { label: "AI Tools" },
            "pdf-tools": { label: "PDF Tools" },
            "image-tools": { label: "Image Tools" },
            "utility-tools": { label: "Utility Tools" },
            "developer-tools": { label: "Developer Tools" },
            "browser-extensions": { label: "Browser Extensions" },
          },
        },
      },
    },
    "chrome-extensions": {
      label: "Chrome Extensions",
      modules: {
        extensions: { label: "Extensions" },
        settings: { label: "Settings" },
      },
    },
  },
});
