import { BookOpenText, BriefcaseBusiness, Contact, Home, Info, LayoutPanelTop } from "lucide-react";

const coozterConfig = {
  id: "coozter",
  name: "Coozter",
  logo: "/logos/coozter-icon.svg",
  color: "#14B8A6",
  modules: {
    navbar: { label: "Navbar", icon: LayoutPanelTop },
    home: { label: "Home Page", icon: Home },
    about: { label: "About Page", icon: Info },
    services: { label: "Services Page", icon: BriefcaseBusiness },
    blog: { label: "Blog Page", icon: BookOpenText },
    "contact-us": { label: "Contact Us", icon: Contact },
  },
};

export default coozterConfig;
