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
        notifications: { label: "Notifications" },
        pages: { label: "Pages" },
        questions: { label: "Questions" },
        quizcategories: { label: "Quiz Categories" },
        spinprizes: { label: "Spin Prizes" },
        tasks: { label: "Tasks" },
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
