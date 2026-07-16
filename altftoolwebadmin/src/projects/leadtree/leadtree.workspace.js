// LeadTree registers itself — Admin Panel + Public Website.
import { registerProject } from "@/lib/workspace/registry";

registerProject({
  id: "leadtree",
  name: "Lead Tree",
  applications: {
    "admin-panel": {
      label: "Admin Panel",
      default: true,
      modules: {
        blogs: { label: "Blogs" },
        creditcard: { label: "Credit Cards" },
        expertvideos: { label: "Expert Videos" },
        ourteams: { label: "Our Teams" },
      },
    },
    "public-website": {
      label: "Public Website",
      modules: {
        home: { label: "Home" },
        blog: { label: "Blog" },
        "credit-cards": { label: "Credit Cards" },
        "expert-videos": { label: "Expert Videos" },
      },
    },
  },
});
