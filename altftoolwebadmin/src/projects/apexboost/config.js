import { FileText, Layout, MessageSquare, Star, Briefcase, DollarSign, Users, BarChart3, Settings, Layers, Home } from "lucide-react";
import Leadtreelogo from "../../../public/logos/leadlogo.png"

const apexboostConfig = {
  id: "apexboost",
  name: "Apex Boost",
  logo: Leadtreelogo,
  color: "#10b981",
  modules: {
    frontend: { label: "Frontend", icon: Layout, routeSegment: "frontend" },
    hero: { label: "Hero Section", icon: Home },
    blogs: { label: "Blogs", icon: FileText },
    services: { label: "Services", icon: Briefcase },
    testimonials: { label: "Testimonials", icon: MessageSquare },
    portfolio: { label: "Portfolio", icon: Layers },
    faq: { label: "FAQ", icon: MessageSquare },
    features: { label: "Features", icon: Star },
    stats: { label: "Statistics", icon: BarChart3 },
    process: { label: "Process", icon: FileText },
    whyChooseUs: { label: "Why Choose Us", icon: Star },
    cta: { label: "Call to Action", icon: MessageSquare },
    navLinks: { label: "Navigation", icon: Layout },
    contact: { label: "Contact", icon: MessageSquare },
  },
};

export default apexboostConfig;
