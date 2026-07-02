import {
  LayoutDashboard,
  TicketPercent,
  FolderTree,
  Store,
  BadgePercent,
  FileText,
  HelpCircle,
  Image,
  Megaphone,
  CreditCard,
  Package,
  Settings,
  DatabaseZap,
} from "lucide-react";
import MyLuckyDealLogo from "../../../public/logos/myluckydeallogo.png";

const myluckydealConfig = {
  id: "myluckydeal",
  name: "My Lucky Deal",
  logo: MyLuckyDealLogo,
  color: "#5b5cff",
  modules: {
    dashboard: { label: "Dashboard", icon: LayoutDashboard },
    deals: { label: "Deals", icon: TicketPercent },
    categories: { label: "Categories", icon: FolderTree },
    stores: { label: "Stores", icon: Store },
    coupons: { label: "Coupons", icon: BadgePercent },
    blogs: { label: "Blogs", icon: FileText },
    faqs: { label: "FAQs", icon: HelpCircle },
    hero: { label: "Hero Slides", icon: Image },
    ads: { label: "Ads", icon: Megaphone },
    offers: { label: "Featured Offers", icon: CreditCard },
    collections: { label: "Collections", icon: Package },
    settings: { label: "Site Settings", icon: Settings },
    migration: { label: "Seed Migration", icon: DatabaseZap },
  },
};

export default myluckydealConfig;
