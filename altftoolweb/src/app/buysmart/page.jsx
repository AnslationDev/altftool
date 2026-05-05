import BuySmartClient from "./BuySmartClient";

export async function generateMetadata() {
  return {
    title: "BuySmart – Smart Product & Tool Deals | AltFTool",
    description:
      "Explore BuySmart on AltFTool for smart product and tool deals, top recommendations, and helpful insights to choose the best tools, software, and gadgets.",
  };
}

export default function Page() {
  return <BuySmartClient />;
}