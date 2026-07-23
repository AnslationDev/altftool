import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("roomrevive");

export default function RoomReviveLayout({ children }) {
  return children;
}
