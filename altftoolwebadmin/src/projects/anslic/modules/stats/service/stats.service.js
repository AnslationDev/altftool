import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "anslic";
const STATS_SETTINGS_PATH = ["projects", PROJECT_ID, "stats", "settings"];

export const DEFAULT_STATS_SETTINGS = {
  items: [
    { value: "240+", label: "Growth Partners" },
    { value: "98%", label: "Client Retention" },
    { value: "35+", label: "Markets Served" },
    { value: "12", label: "Awards Won" },
  ],
};

const settingsService = createSingletonDocService(STATS_SETTINGS_PATH, DEFAULT_STATS_SETTINGS);

export const subscribeStatsSettings = settingsService.subscribe;
export const saveStatsSettings = settingsService.save;
export const resetStatsSettings = settingsService.reset;
