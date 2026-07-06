import {
  Trophy,
  Bell,
  Megaphone,
  FileText,
  Users as UsersIcon,
  Image,
  ListChecks,
  FolderTree,
  HelpCircle,
  Disc3,
  Video,
  Coins,
  Settings,
  DatabaseZap,
} from "lucide-react";
import AnternetLogo from "../../../public/logos/anternetlogo.png";

const anternetConfig = {
  id: "anternet",
  name: "Anternet",
  logo: AnternetLogo,
  color: "#14B8A6",
  modules: {
    banners: { label: "Home Banners", icon: Image },
    tasks: { label: "Daily Tasks", icon: ListChecks },
    quizcategories: { label: "Quiz Categories", icon: FolderTree },
    questions: { label: "Quiz Questions", icon: HelpCircle },
    spinprizes: { label: "Spin Prizes", icon: Disc3 },
    videosections: { label: "Video Sections", icon: Video },
    earningtasks: { label: "Earning Tasks", icon: Coins },
    ads: { label: "Ads & Promos", icon: Megaphone },
    arenas: { label: "Featured Arenas", icon: Trophy },
    notifications: { label: "Notifications", icon: Bell },
    pages: { label: "CMS Pages", icon: FileText },
    users: { label: "Users", icon: UsersIcon },
    settings: { label: "App Settings", icon: Settings },
    migration: { label: "Seed Migration", icon: DatabaseZap },
  },
};

export default anternetConfig;
