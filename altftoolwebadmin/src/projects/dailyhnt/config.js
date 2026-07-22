import {
  Building2,
  Contact,
  FileText,
  HelpCircle,
  Home,
  LayoutPanelTop,
  Layers3,
  MessageSquareQuote,
  Newspaper,
  PanelBottom,
  Settings,
  Shield,
  Users,
} from "lucide-react";

/**
 * Key order matters: the first module is the project's landing page and the
 * order here drives the sidebar. `seo` is intentionally absent — it is
 * auto-injected by withSharedModules.
 *
 * Every module is a single-page module (route key "") that manages its own
 * settings doc(s) + ordered collections inline, mirroring the CareerBook team
 * admin pattern. All content is written under `projects/dailyhnt/...` in
 * Firestore and read back by the public DailyHnt frontend.
 */
const dailyhntConfig = {
  id: "dailyhnt",
  name: "DailyHNT",
  logo: "/logos/carrerbook-icon.png",
  color: "var(--primary)",
  modules: {
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    home: { label: "Home", icon: Home },
    services: { label: "Services", icon: Layers3 },
    team: { label: "Team", icon: Users },
    blog: { label: "Blog", icon: Newspaper },
    testimonials: { label: "Testimonials", icon: MessageSquareQuote },
    faq: { label: "FAQ", icon: HelpCircle },
    "about-us": { label: "About Us", icon: Building2 },
    "contact-us": { label: "Contact Us", icon: Contact },
    policy: { label: "Privacy Policy", icon: Shield },
    "term-condition": { label: "Terms & Conditions", icon: FileText },
    footer: { label: "Footer", icon: PanelBottom },
    "site-settings": { label: "Site Settings", icon: Settings },
  },
};

export default dailyhntConfig;
