import DealsClient from "./DealsClient";

export async function generateMetadata() {
  return {
    title: "Best Deals & Offers – Save on Top Products | AltFTool",
    description:
      "Discover the best deals, discounts, and special offers on AltFTool. Compare prices and find the best savings on popular products and services.",
  };
}

export default function Page() {
  return <DealsClient />;
}