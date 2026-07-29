import { PRODUCT_PHASES, PRODUCT_REGISTRY } from "@altftool/core/products";
import { PRODUCT_SUITE_CATALOG, PRODUCT_SUITE_STATUSES } from "@altftool/core/product-suites";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import ProductsDirectory from "./ProductsDirectory";

const description =
  "Explore the AltFTool product suite for research, productivity, security, creators, students, developers, and practical everyday work.";

// Counts are read from the catalogue, never typed, so they cannot go stale when
// a suite is added or a status changes.
function countByStatus(status) {
  return PRODUCT_SUITE_CATALOG.filter((suite) => suite.status === status).length;
}

function buildAnswer() {
  const total = PRODUCT_SUITE_CATALOG.length;
  return `AltFTool groups its utilities into ${total} product workspaces: ${countByStatus("working")} working, ${countByStatus("beta")} in public beta and ${countByStatus("gated")} security gated with nothing released. Each workspace either runs a tool on its own page or routes you into the individual utilities behind it, and the state shown next to every name is the real one - AltF Vault, for example, stores no passwords and is listed as gated rather than hidden.`;
}

function buildFaqs() {
  const total = PRODUCT_SUITE_CATALOG.length;
  const gated = PRODUCT_SUITE_CATALOG.filter((suite) => suite.status === "gated");
  const beta = PRODUCT_SUITE_CATALOG.filter((suite) => suite.status === "beta");
  return [
    {
      question: "How many AltFTool product workspaces are there?",
      answer: `There are ${total}: ${PRODUCT_SUITE_CATALOG.map((suite) => suite.name).join(", ")}. ${countByStatus("working")} are working, ${countByStatus("beta")} are in public beta and ${countByStatus("gated")} is security gated.`,
    },
    {
      question: "Do AltFTool products cost anything or need an account?",
      answer:
        "No. Every product workspace listed on this page is free to open and none of them require a sign-in, a trial or a payment method.",
    },
    {
      question: `What do "${PRODUCT_SUITE_STATUSES.beta}" and "${PRODUCT_SUITE_STATUSES.gated}" mean on an AltFTool product?`,
      answer: `Public beta means the workspace works but its feature set is still changing - currently ${beta.map((suite) => suite.name).join(", ")}. Security gated means nothing has been released at all: ${gated.map((suite) => suite.name).join(", ")} publishes the review conditions it must clear and stores no user data in the meantime.`,
    },
    {
      question: "Does everything on AltFTool run in the browser?",
      answer:
        "No, and the pages say which is which. AltF IdeaLab, Minutes, Security, Authenticator and Flow do their work in the browser with no network request, while AltF DomainOps queries public DNS and RDAP providers and AltF NetCheck times requests against an AltFTool endpoint. The directory workspaces run nothing themselves and defer to the privacy label on each linked tool.",
    },
  ];
}

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Products - Practical Workspaces and Utilities",
    description,
    path: "/products",
    keywords: ["online tools", "productivity workspaces", "developer tools", "local-first tools"],
  });
}

export default function ProductsPage() {
  const faqs = buildFaqs();

  return (
    <>
      <JsonLd
        id="altf-products-schema"
        data={[
          createCollectionPageJsonLd({ path: "/products", name: "AltFTool Products", description }),
          // The suite catalogue, not PRODUCT_REGISTRY: every suite has a real
          // public URL, while many registry entries are internal platform
          // components with no page to point an ItemList at.
          createItemListJsonLd({
            path: "/products",
            name: "AltFTool product workspaces",
            items: PRODUCT_SUITE_CATALOG.map((suite) => ({
              name: suite.name,
              path: `/products/${suite.slug}`,
            })),
          }),
          createFaqJsonLd({ path: "/products", questions: faqs }),
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
        answer={buildAnswer()}
        faqs={faqs}
      />
    </>
  );
}
