import { FileText, CreditCard, UsersIcon, Video } from "lucide-react";
import Leadtreelogo from "../../../public/logos/leadlogo.png"

const leadtreeConfig = {
  id: "leadtree",
  name: "Lead Tree",
  logo: Leadtreelogo,
  color: "#10b981",
  modules: {
    blogs: { label: "Blogs", icon: FileText },
    creditcard: { label: "Credit Cards", icon: CreditCard, routeSegment: "credit-cards" },
    expertvideos: { label: "Expert Videos", icon: Video, routeSegment: "expert-videos" },
    ourteams: { label: "Our Teams", icon: UsersIcon },
  },
};

export default leadtreeConfig;
