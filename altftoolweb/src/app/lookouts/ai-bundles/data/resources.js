import { BookOpen, GitCompare, Lightbulb, Newspaper, PlusCircle, Wrench } from "lucide-react";

/**
 * Learning & Resources — links to real, existing routes on the site rather
 * than fabricated article URLs.
 */
export const LEARNING_RESOURCES = [
  {
    id: "guides",
    title: "AI Tool Guides & Articles",
    description: "In-depth write-ups on tools, workflows, and how to get the most out of them.",
    icon: BookOpen,
    href: "/blogs",
    cta: "Read the blog",
  },
  {
    id: "news",
    title: "Latest AI & Tech News",
    description: "Fresh tool launches, product updates, and industry news, aggregated daily.",
    icon: Newspaper,
    href: "/news",
    cta: "See what's new",
  },
  {
    id: "academy",
    title: "AltFTool Academy",
    description: "Course and platform comparisons to help you build real skills, faster.",
    icon: Lightbulb,
    href: "/academy",
    cta: "Visit the academy",
  },
  {
    id: "comparisons",
    title: "Tool Comparisons",
    description: "Head-to-head breakdowns of popular tools versus their paid alternatives.",
    icon: GitCompare,
    href: "/alternatives",
    cta: "Compare tools",
  },
  {
    id: "microtools",
    title: "Free Microtools Directory",
    description: "100+ free calculators, converters, and generators for everyday tasks.",
    icon: Wrench,
    href: "/tools",
    cta: "Browse microtools",
  },
  {
    id: "request",
    title: "Suggest a Tool",
    description: "Know a great free AI tool we're missing? Send it in for review.",
    icon: PlusCircle,
    href: "/request-a-tool",
    cta: "Request a tool",
  },
];
