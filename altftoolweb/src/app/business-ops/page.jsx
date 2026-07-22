import { LayoutGrid } from "lucide-react";
import BusinessOpsHeader from "./components/BusinessOpsHeader";
import BusinessOpsCatalog from "./components/BusinessOpsCatalog";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { BUSINESS_OPS_PRODUCTS, getBusinessOpsStats } from "./businessOps";
import "./business-ops.css";
import "@/app/_altf/altf-brand.css";

export const metadata = createPageMetadata({
  title: "Business Ops",
  description:
    "Explore AltFTool business products for travel, housing services, loans, insurance, operations, and customer workflows.",
  path: "/business-ops",
  keywords: [
    "business tools",
    "travel planning",
    "housing services",
    "loan guides",
    "insurance guides",
    "AltFTool business ops",
  ],
});

const STATS = [
  { key: "total", label: "Products" },
  { key: "live", label: "Live" },
  { key: "planned", label: "In development" },
  { key: "sections", label: "Sections" },
];

export default function BusinessOpsPage() {
  const stats = getBusinessOpsStats();

  return (
    <div className="bizops-page">
      <BusinessOpsHeader />

      <section className="bizops-hero">
        <div className="bizops-hero-inner">
          <p className="bizops-kicker">
            <LayoutGrid size={13} strokeWidth={2.4} />
            Business operations
          </p>

          <h1 className="bizops-title">
            Every business property,{" "}
            <span className="bizops-title-accent">one place</span>
          </h1>

          <p className="bizops-lede">
            Focused products that run inside AltFTool, each with its own
            workflow and content. Open a live product below, or track
            what is still in development.
          </p>

          <div className="bizops-stats">
            {STATS.map((stat) => (
              <div key={stat.key} className="bizops-stat">
                <div className="bizops-stat-value">{stats[stat.key]}</div>
                <div className="bizops-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="bizops-main">
        <BusinessOpsCatalog products={BUSINESS_OPS_PRODUCTS} />
      </main>

      <AltfLauncher />
    </div>
  );
}
