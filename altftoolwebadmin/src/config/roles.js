import { Megaphone, Tag, ShoppingCart, Image, Wrench, ShieldIcon } from "lucide-react";

export const ROLE_ROUTES = {
  ads: { label: "Ads", path: "/ads", icon: Megaphone },
  buysmart: { label: "BuySmart", path: "/buysmart", icon: ShoppingCart },
  blogs: { label: "Blogs", path: "/blogs", icon: Tag },
  extensions: { label: "Extensions", path: "/extensions", icon: Wrench },
  images: { label: "Media", path: "/images", icon: Image },
  "admin-management": { label: "Admin Management", path: "/admin-management", icon: ShieldIcon },
};
