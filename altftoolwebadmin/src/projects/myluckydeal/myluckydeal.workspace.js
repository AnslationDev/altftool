// My Lucky Deal registers itself — Admin Panel only (for now).
import { registerProject } from "@/lib/workspace/registry";

registerProject({
  id: "myluckydeal",
  name: "My Lucky Deal",
  applications: {
    "admin-panel": {
      label: "Admin Panel",
      default: true,
      modules: {
        dashboard: { label: "Dashboard" },
        ads: { label: "Ads" },
        blogs: { label: "Blogs" },
        categories: { label: "Categories" },
        collections: { label: "Collections" },
        coupons: { label: "Coupons" },
        deals: { label: "Deals" },
        faqs: { label: "FAQs" },
        hero: { label: "Hero" },
        offers: { label: "Offers" },
        stores: { label: "Stores" },
        settings: { label: "Settings" },
        migration: { label: "Migration" },
      },
    },
  },
});
