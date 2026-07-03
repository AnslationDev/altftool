import {
  Building2,
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
    team: { label: "Team", icon: Users },
  },
};

export default carrerbookConfig;
