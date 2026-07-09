import { BookOpenText, BriefcaseBusiness, Home, Info } from "lucide-react";

const coozterConfig = {
  id: "coozter",
  name: "Coozter",
  logo: "/logos/coozter-icon.svg",
  color: "#14B8A6",
  modules: {
    home: { label: "Home Page", icon: Home },
    about: { label: "About Page", icon: Info },
    services: { label: "Services Page", icon: BriefcaseBusiness },
    blog: { label: "Blog Page", icon: BookOpenText },
  },
};

export default coozterConfig;
