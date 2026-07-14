import { Home, Info, Sliders, Briefcase, FileText, Image, Inbox } from "lucide-react";
import AlphobiaLogo from "../../../public/logos/altflogo.png"; // Default logo placeholder

const alphobiaConfig = {
  id: "alphobia",
  name: "Alphobia",
  logo: AlphobiaLogo,
  color: "#0f172a", // Deep Slate
  modules: {
    home: { label: "Home Page", icon: Home },
    about: { label: "About Page", icon: Info },
    services: { label: "Services & FAQs", icon: Sliders },
    casestudies: { label: "Case Studies Catalog", icon: Briefcase, routeSegment: "case-studies" },
    insights: { label: "Insights & Guides", icon: FileText },
    assets: { label: "Assets & Library", icon: Image },
    contacts: { label: "Contacts & Leads", icon: Inbox },
  },
};

export default alphobiaConfig;
