import {
  FileText,
  Star,
  Briefcase,
  Mail,
  Users,
  Settings,
  Home,
  Calendar,
} from "lucide-react";
import MarketysLogo from "../../../public/logos/marketys-logo.svg";

const marketysConfig = {
  id: "marketys",
  name: "Marketys",
  logo: MarketysLogo,
  color: "#2563eb",
  modules: {
    about: { label: "About", icon: Users },
    home: { label: "Home", icon: Home },
    blogs: { label: "Blogs", icon: FileText },
    reviews: { label: "Reviews", icon: Star },
    services: { label: "Services", icon: Briefcase },
    bookings: { label: "Bookings", icon: Calendar },
    contact: { label: "Contact", icon: Mail },
    team: { label: "Team", icon: Users },
    settings: { label: "Settings", icon: Settings },
  },
};

export default marketysConfig;
