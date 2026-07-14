import { Home, Info, Target, Layers, BookOpen, Mail, FileText, Boxes, MessageSquare } from "lucide-react";
import SmartLuckyLogo from "../../../public/logos/smartluckylogo.svg";

const smartluckyConfig = {
  id: "smartlucky",
  name: "Smart Lucky",
  logo: SmartLuckyLogo,
  color: "#2563eb",
  modules: {
    home: { label: "Home", icon: Home, routeSegment: "home" },
    about: { label: "About", icon: Info, routeSegment: "about" },
    services: { label: "Services", icon: Target, routeSegment: "services-page" },
    solutions: { label: "Solutions", icon: Layers, routeSegment: "solutions-page" },
    resources: { label: "Resources", icon: BookOpen, routeSegment: "resources" },
    contact: { label: "Contact", icon: Mail, routeSegment: "contact" },
    blog: { label: "Blog", icon: FileText, routeSegment: "blog" },
    platforms: { label: "Platforms", icon: Boxes, routeSegment: "platforms-page" },
    "contact-submissions": { label: "Contact Submissions", icon: MessageSquare, routeSegment: "contact-submissions" },
  },
};

export default smartluckyConfig;
