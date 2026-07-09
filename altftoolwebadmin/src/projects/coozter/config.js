import { BookOpenText, BriefcaseBusiness, Home, Info } from "lucide-react";

const coozterConfig = {
  id: "coozter",
  name: "Coozter",
  logo: "/logos/coozter-icon.svg",
  color: "#14B8A6",
  modules: {
    home: { label: "Home ", icon: Home },
    about: { label: "About us", icon: Info },
    services: { label: "Our Services ", icon: BriefcaseBusiness },
    blog: { label: "Our Blogs ", icon: BookOpenText },
  },
};

export default coozterConfig;
