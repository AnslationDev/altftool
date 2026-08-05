import { Clapperboard, Code2, Image as ImageIcon, MessageSquare, Palette } from "lucide-react";
import ChatbotScene from "./ChatbotScene";
import DeveloperToolsScene from "./DeveloperToolsScene";
import ImageEditingScene from "./ImageEditingScene";
import UiUxScene from "./UiUxScene";
import VideoEditingScene from "./VideoEditingScene";

export const SHOWCASE_SCENES = [
  {
    id: "video",
    label: "Video Editing",
    icon: Clapperboard,
    accent: ["#f43f5e", "#fb923c"],
    Scene: VideoEditingScene,
  },
  {
    id: "image",
    label: "Image Editing",
    icon: ImageIcon,
    accent: ["#a855f7", "#ec4899"],
    Scene: ImageEditingScene,
  },
  {
    id: "dev",
    label: "Developer Tools",
    icon: Code2,
    accent: ["#22c55e", "#14b8a6"],
    Scene: DeveloperToolsScene,
  },
  {
    id: "chat",
    label: "AI Chatbots",
    icon: MessageSquare,
    accent: ["#7c3aed", "#2563eb"],
    Scene: ChatbotScene,
  },
  {
    id: "design",
    label: "UI/UX Design",
    icon: Palette,
    accent: ["#0ea5e9", "#6366f1"],
    Scene: UiUxScene,
  },
];
