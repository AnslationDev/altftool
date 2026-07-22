import {
  Megaphone,
  Tag,
  ShoppingCart,
  Image,
  Wrench,
  GraduationCap,
  Video,
  BadgePercent,
  TicketPercent,
  Star,
  Plane,
  Sparkles,
  Search,
  LayoutTemplate,
  Radar,
} from "lucide-react";
import AltfLogo from "../../../public/logos/altflogo.png";

const altftoolConfig = {
  id: "altftool",
  name: "AltFTool",
  logo: AltfLogo,
  color: "#6366f1",
  modules: {
    ads: { label: "Ads", icon: Megaphone },
    buysmart: { label: "BuySmart", icon: ShoppingCart },
    blogs: { label: "Blogs", icon: Tag },
    landing: { label: "Landing Pages", icon: LayoutTemplate },
    deals: { label: "Deals", icon: TicketPercent },
    consumerrating: { label: "Consumer Rating", icon: Star, routeSegment: "consumer-rating" },
    extensions: { label: "Extensions", icon: Wrench },
    images: { label: "Media", icon: Image },
    academy: { label: "Academy", icon: GraduationCap },
    trendingVideos: { label: "Trending Videos", icon: Video, routeSegment: "trending-videos" },
    salelocator: { label: "Sale Locator", icon: BadgePercent, routeSegment: "sale-locator" },
    dynamic: { label: "Dynamic", icon: Star },
    pintrest: { label: "Pinterest", icon: Image, routeSegment: "pintrest" },
    tripfindbox: { label: "TripFindBox", icon: Plane, routeSegment: "tripfindbox" },
    pranksocialmedia: { label: "Prank Social Media", icon: Sparkles, routeSegment: "prank-socialmedia" },
    pranx: { label: "Pranx", icon: Sparkles, routeSegment: "pranx" },
    sketchflow: { label: "Sketch Flow", icon: Sparkles, routeSegment: "sketchflow" },
    seo: { label: "SEO Engine", icon: Search, routeSegment: "seo" },
    products: { label: "Products & Signals", icon: Radar, routeSegment: "products" },
  },
};

export default altftoolConfig;
