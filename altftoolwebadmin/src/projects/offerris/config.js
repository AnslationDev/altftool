import {
  Contact,
  FileText,
  Handshake,
  Home,
  HelpCircle,
  LayoutPanelTop,
  MessageSquareQuote,
  Newspaper,
  PanelBottom,
  ScrollText,
  Settings,
  Users,
  Layers3,
} from "lucide-react";

const offerrisConfig = {
  id: "offerris",
  name: "Offerris",
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
    "about-us": { label: "About Us", icon: FileText },
    "contact-us": { label: "Contact Us", icon: Contact },
    policy: { label: "Policy", icon: ScrollText },
    "term-condition": { label: "Term & Condition", icon: Handshake },
    footer: { label: "Footer", icon: PanelBottom },
  },
};

export default offerrisConfig;
