import {
  Building2,
  Contact,
  FileText,
  HelpCircle,
  Home,
  LayoutPanelTop,
  Layers3,
  ListChecks,
  MessageSquareQuote,
  Newspaper,
  PanelBottom,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

const infovastaConfig = {
  id: "infovasta",
  name: "Infovasta",
  logo: "/logos/carrerbook-icon.png",
  color: "var(--primary)",
  modules: {
    "site-settings": { label: "Site Settings", icon: Settings },
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    home: { label: "Home", icon: Home },
    services: { label: "Services", icon: Layers3 },
    "why-choose-us": { label: "Why Choose Us", icon: Sparkles },
    process: { label: "Process", icon: ListChecks },
    team: { label: "Team", icon: Users },
    testimonials: { label: "Testimonials", icon: MessageSquareQuote },
    portfolio: { label: "Portfolio", icon: Building2 },
    blog: { label: "Blog", icon: Newspaper },
    faq: { label: "FAQ", icon: HelpCircle },
    "about-us": { label: "About Us", icon: FileText },
    "contact-us": { label: "Contact Us", icon: Contact },
    footer: { label: "Footer", icon: PanelBottom },
  },
};

export default infovastaConfig;
