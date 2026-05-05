import TrendingClient from "./TrendingClient";
import   "./styles/trendingvids.css";
export async function generateMetadata() {
  return {
    title: "Trending Videos – Watch Viral & Popular Videos",
    description:
      "Watch the latest trending videos on AltFTool. Discover viral clips, popular content, and the most watched videos from across the web in one place.",
  };
}

export default function Page() {
  return <TrendingClient />;
}