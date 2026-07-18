import {
  BarChart3,
  Building2,
  Contact,
  Home,
  LayoutPanelTop,
  Newspaper,
  PanelBottom,
  Users,
  Layers3,
} from "lucide-react";

const anslicConfig = {
  id: "anslic",
  name: "Anslic",
  logo: "/logos/carrerbook-icon.png",
  color: "#10b981",
  modules: {
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    footer: { label: "Footer", icon: PanelBottom },
    home: { label: "Home", icon: Home },
    about: { label: "About", icon: Building2 },
    stats: { label: "Stats", icon: BarChart3 },
    services: { label: "Services", icon: Layers3 },
    team: { label: "Team", icon: Users },
    blog: { label: "Blog", icon: Newspaper },
    contact: { label: "Contact", icon: Contact },
  },
};

export default anslicConfig;
