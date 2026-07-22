import {
  Building2,
  Contact,
  FileText,
  HelpCircle,
  Home,
  LayoutPanelTop,
  MessageSquareQuote,
  Newspaper,
  PanelBottom,
  Layers3,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";

const samvatsaraConfig = {
  id: "samvatsara",
  name: "Samvatsara",
  logo: "/logos/carrerbook-icon.png",
  color: "var(--primary)",
  modules: {
    "site-settings": { label: "Site Settings", icon: Settings },
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    home: { label: "Home", icon: Home },
    services: { label: "Services", icon: Layers3 },
    team: { label: "Team", icon: Users },
    blog: { label: "Blog", icon: Newspaper },
    testimonials: { label: "Testimonials", icon: MessageSquareQuote },
    faq: { label: "FAQ", icon: HelpCircle },
    portfolio: { label: "Portfolio", icon: Building2 },
    "about-us": { label: "About Us", icon: FileText },
    "contact-us": { label: "Contact Us", icon: Contact },
    policy: { label: "Policy", icon: ScrollText },
    "term-condition": { label: "Term & Condition", icon: ScrollText },
    footer: { label: "Footer", icon: PanelBottom },
  },
};

export default samvatsaraConfig;
