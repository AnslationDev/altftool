import {
  Briefcase,
  Home,
  Inbox,
  LayoutPanelTop,
  Newspaper,
  PanelBottom,
  FileText,
  Trophy,
} from "lucide-react";

const growvibeConfig = {
  id: "growvibe",
  name: "GrowVibe",
  logo: "/logos/growvibe-icon.png",
  color: "#2743f0",
  modules: {
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    home: { label: "Home", icon: Home },
    services: { label: "Services", icon: Briefcase },
    "case-studies": { label: "Case Studies", icon: Trophy },
    blog: { label: "Blog", icon: Newspaper },
    pages: { label: "Pages", icon: FileText },
    leads: { label: "Leads", icon: Inbox },
    footer: { label: "Footer", icon: PanelBottom },
  },
};

export default growvibeConfig;
