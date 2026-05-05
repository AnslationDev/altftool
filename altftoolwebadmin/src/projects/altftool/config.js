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
    deals: { label: "Deals", icon: TicketPercent },
    consumerrating: { label: "Consumer Rating", icon: Star, routeSegment: "consumer-rating" },
    extensions: { label: "Extensions", icon: Wrench },
    images: { label: "Media", icon: Image },
    academy: { label: "Academy", icon: GraduationCap },
    trendingVideos: { label: "Trending Videos", icon: Video, routeSegment: "trending-videos" },
    salelocator: { label: "Sale Locator", icon: BadgePercent, routeSegment: "sale-locator" },
    dynamic: { label: "Dynamic", icon: Star },
  },
};

export default altftoolConfig;
