import SaleClient from "./SaleClient";

export async function generateMetadata() {
  return {
    title: "Sale Locator – Find Nearby Deals and Offers | AltFTool",
    description:
      "Use the AltFTool Sale Locator to discover nearby sales, discounts, and special offers. Find the best deals at stores and online locations near you.",
  };
}

export default function Page() {
  return <SaleClient />;
}