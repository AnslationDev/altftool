// Anternet registers itself — Admin Panel + Browser Extension.
import { registerProject } from "@/lib/workspace/registry";

registerProject({
  id: "anternet",
  name: "Anternet",
  applications: {
    "admin-panel": {
      label: "Admin Panel",
      default: true,
      modules: {
        ads: { label: "Ads" },
        arenas: { label: "Arenas" },
        banners: { label: "Banners" },
        earningtasks: { label: "Earning Tasks" },
        homepage: { label: "Trendy Tasks" },
        walletpage: { label: "Wallet Page" },
        notifications: { label: "Notifications" },
        pages: { label: "Pages" },
        questions: { label: "Questions" },
        quizcategories: { label: "Quiz Categories" },
        spinprizes: { label: "Spin Prizes" },
        tasks: { label: "Tasks" },
        winners: { label: "Winners" },
        quickearn: { label: "Quick Earn Cards" },
        explorecards: { label: "Recommended Cards" },
        homecategories: { label: "Explore Categories" },
        bonusladdertiers: { label: "Bonus Ladder Tiers" },
        khokho: { label: "Kho Kho" },
        users: { label: "Users" },
        videosections: { label: "Video Sections" },
        settings: { label: "Settings" },
        migration: { label: "Migration" },
      },
    },
    "browser-extension": {
      label: "Browser Extension",
      modules: {
        tasks: { label: "Tasks" },
        rewards: { label: "Rewards" },
      },
    },
  },
});
