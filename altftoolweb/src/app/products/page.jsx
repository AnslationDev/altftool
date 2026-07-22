import { PRODUCT_PHASES, PRODUCT_REGISTRY } from "@altftool/core/products";
import { PRODUCT_SUITE_CATALOG } from "@altftool/core/product-suites";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import ProductsDirectory from "./ProductsDirectory";

const description =
  "Explore the AltFTool product suite for research, productivity, security, creators, students, developers, and practical everyday work.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Products - Practical Workspaces and Utilities",
    description,
    path: "/products",
    keywords: ["online tools", "productivity workspaces", "developer tools", "local-first tools"],
  });
}

export default function ProductsPage() {
  return (
    <>
      <JsonLd
        id="altf-products-schema"
        data={[
          createCollectionPageJsonLd({ path: "/products", name: "AltFTool Products", description }),
          createItemListJsonLd({
            path: "/products",
            name: "AltFTool product suite",
            items: PRODUCT_REGISTRY.map((product) => ({ name: product.name, path: product.publicPath })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
          ]),
        ]}
      />
      <ProductsDirectory
        phases={PRODUCT_PHASES}
        products={PRODUCT_REGISTRY}
        suites={PRODUCT_SUITE_CATALOG}
      />
    </>
  );
}
