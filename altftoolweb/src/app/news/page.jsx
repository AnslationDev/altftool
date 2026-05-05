import NewsClient from "./NewsClient";

export async function generateMetadata() {
  return {
    title: "Latest News & Updates – Tech, Tools and Trends | AltFTool",
    description:
      "Stay updated with the latest news on technology, digital tools, software updates, and online trends with AltFTool News.",
  };
}

export default function Page() {
  return <NewsClient />;
}