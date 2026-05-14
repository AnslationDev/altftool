import {
  BookOpen,
  GraduationCap,
  MonitorPlay,
  Newspaper,
  Puzzle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tags,
  Wrench,
} from "lucide-react";

const routeHubMap = {
  academy: {
    eyebrow: "Learning paths",
    title: "Build skills with the rest of AltFTool",
    description:
      "Jump from learning platforms into practical tools, extension picks, and real-world buying guides.",
    items: [
      {
        title: "Tools directory",
        description: "Use the free utilities after learning a workflow.",
        href: "/tools/all",
        icon: Wrench,
      },
      {
        title: "Extensions",
        description: "Add focused browser tools to your daily setup.",
        href: "/extensions",
        icon: Puzzle,
      },
      {
        title: "Digital guides",
        description: "Read practical tutorials and productivity explainers.",
        href: "/blogs",
        icon: BookOpen,
      },
    ],
  },
  extensions: {
    eyebrow: "Extension workflow",
    title: "Pair extensions with tools and guides",
    description:
      "Browse add-ons, then use AltFTool utilities and editorial picks to complete the workflow.",
    items: [
      {
        title: "Developer tools",
        description: "JSON, regex, diff, JWT, and more.",
        href: "/tools/developer",
        icon: Wrench,
      },
      {
        title: "Academy",
        description: "Compare learning platforms for skill growth.",
        href: "/academy",
        icon: GraduationCap,
      },
      {
        title: "Browser guides",
        description: "Read extension and workflow recommendations.",
        href: "/blogs",
        icon: BookOpen,
      },
    ],
  },
  brandrating: {
    eyebrow: "Decision support",
    title: "Compare brands, tools, and deals from one place",
    description:
      "Move from ratings into curated offers, product hubs, and hands-on utilities without losing context.",
    items: [
      {
        title: "Exclusive deals",
        description: "Browse offers by store and category.",
        href: "/exclusivedeals",
        icon: Tags,
      },
      {
        title: "BuySmart",
        description: "Explore buying guides and savings workflows.",
        href: "/buysmart",
        icon: ShoppingBag,
      },
      {
        title: "Top 11 picks",
        description: "Scan ranked shortlists for common categories.",
        href: "/top11",
        icon: Star,
      },
    ],
  },
  buysmart: {
    eyebrow: "Shopping routes",
    title: "Turn product research into faster decisions",
    description:
      "Use deals, rankings, and brand ratings together when you need a quick shortlist.",
    items: [
      {
        title: "All stores",
        description: "Open the full BuySmart store directory.",
        href: "/buysmart/view-all",
        icon: ShoppingBag,
      },
      {
        title: "Exclusive deals",
        description: "Compare offer categories and discount routes.",
        href: "/exclusivedeals",
        icon: Tags,
      },
      {
        title: "Brand ratings",
        description: "Check ratings before you pick a product.",
        href: "/brandrating",
        icon: ShieldCheck,
      },
    ],
  },
  blogs: {
    eyebrow: "Editorial routes",
    title: "Keep reading with useful next steps",
    description:
      "Move from guides into the exact tools, deals, and video workflows they reference.",
    items: [
      {
        title: "All tools",
        description: "Open the utility directory mentioned in guides.",
        href: "/tools/all",
        icon: Wrench,
      },
      {
        title: "Trending videos",
        description: "Watch fresh visual guides and product clips.",
        href: "/trendingvids",
        icon: MonitorPlay,
      },
      {
        title: "Search AltFTool",
        description: "Find guides, tools, extensions, and deals.",
        href: "/search",
        icon: Search,
      },
    ],
  },
  trendingvids: {
    eyebrow: "Watch and act",
    title: "Use videos as a launch point",
    description:
      "After watching, jump into tools, news, and guides that help you take action.",
    items: [
      {
        title: "News",
        description: "Scan current headlines and topic pages.",
        href: "/news",
        icon: Newspaper,
      },
      {
        title: "Blogs",
        description: "Read practical guides behind popular workflows.",
        href: "/blogs",
        icon: BookOpen,
      },
      {
        title: "Tools",
        description: "Open utilities for media, text, data, and files.",
        href: "/tools/all",
        icon: Wrench,
      },
    ],
  },
};

export const routeHubKeys = Object.keys(routeHubMap);

export function getRouteHub(key) {
  return routeHubMap[key] || null;
}

export function getRouteHubItems(key) {
  return getRouteHub(key)?.items || [];
}

export function getRouteHubJsonLdItems(key) {
  return getRouteHubItems(key).map((item) => ({
    name: item.title,
    path: item.href,
  }));
}
