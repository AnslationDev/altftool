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
  name: "AltF Tools",
  logo: AltfLogo, // 👈 rename this
  color: "#6366f1",
  modules: {
    ads: { label: "Ads", icon: Megaphone },
    buysmart: { label: "BuySmart", icon: ShoppingCart },
    blogs: { label: "Blogs", icon: Tag },
    deals: { label: "Deals", icon: TicketPercent },
    consumerrating: { label: "Consumer Rating", icon: Star },
    extensions: { label: "Extensions", icon: Wrench },
    images: { label: "Media", icon: Image },
    academy: { label: "Academy", icon: GraduationCap },
    trendingVideos: { label: "Trending Videos", icon: Video },
    salelocator: { label: "Sale Locator", icon: BadgePercent },
    dynamic: { label: "Dynamic", icon: Star },
  },
};

export default altftoolConfig;
