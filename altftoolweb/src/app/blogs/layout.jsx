import { BlogsProvider } from "./context/BlogsProvider";
import { CategoriesProvider } from "./context/CategoriesProvider";

export async function generateMetadata() {
  return {
    title: "AltFTool Blog – Tips, Guides & Tech Insights",
    description:
      "Read the latest articles on the AltFTool Blog. Discover helpful tips, in-depth guides, tech insights, and updates about tools, software, and digital productivity.",
  };
}

export default function BlogsLayout({ children }) {
  return (
     <CategoriesProvider>
      <BlogsProvider>
        {children}
      </BlogsProvider>
    </CategoriesProvider>
  );
}