import {
  Building2,
  CalendarDays,
  Contact,
  Home,
  LayoutPanelTop,
  Newspaper,
  PanelBottom,
  PenTool,
  Users,
} from "lucide-react";

const carrerbookConfig = {
  id: "carrerbook",
  name: "CareerBook",
  logo: "/logos/carrerbook-icon.png",
  color: "#10b981",
  modules: {
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    footer: { label: "Footer", icon: PanelBottom },
    home: { label: "Home", icon: Home },
    "contact-us": { label: "Contact Us", icon: Contact },
    advertiser: { label: "Advertiser", icon: Building2 },
    publisers: { label: "Publisers", icon: PenTool },
    blog: { label: "Blog", icon: Newspaper },
    "about-us": { label: "About Us", icon: Building2 },
     "term-condition": { label: "Term & Condition", icon: Building2 },
    policy: { label: "Policy", icon: Building2 },
    service:{label: "Service", icon: Building2},
    events: { label: "Events", icon: CalendarDays },
    team: { label: "Team", icon: Users },
  },
};

export default carrerbookConfig;
