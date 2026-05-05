import { Users, Megaphone, FileText, CreditCard, SpeakerIcon, Video } from "lucide-react";
import Leadtreelogo from "../../../public/logos/leadlogo.png"

const leadtreeConfig = {
  id: "leadtree",
  name: "Lead Tree",
  logo: Leadtreelogo,
  color: "#10b981",
  modules: {
  
    blogs:{ label: "Blogs", icon: FileText,  path: "/leadtree/blogs" },
    creditcard: { label: "CreditCard", icon: CreditCard, path: "/leadtree/creditcard" },
    expertvideos: { label: "Expert Video", icon: Video, path: "/leadtree/expertvideos" },
  },
};

export default leadtreeConfig;