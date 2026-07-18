import {
  Building2,
  Contact,
  Home,
  Layers3,
  LayoutPanelTop,
  Newspaper,
  PanelBottom,
  Tag,
} from "lucide-react";

/**
 * Key order matters: the first module is the project's landing page and the
 * order here drives the sidebar. `seo` is intentionally absent — it is
 * auto-injected by withSharedModules.
 */
const infodrifConfig = {
  id: "infodrif",
  name: "Infodrif",
  logo: "/logos/carrerbook-icon.png",
  color: "#ff6a63",
  modules: {
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    home: { label: "Home", icon: Home },
    about: { label: "About", icon: Building2 },
    partners: { label: "Partners", icon: Layers3 },
    blog: { label: "Blog", icon: Newspaper },
    offers: { label: "Offers", icon: Tag },
    contact: { label: "Contact", icon: Contact },
    footer: { label: "Footer", icon: PanelBottom },
  },
};

export default infodrifConfig;
