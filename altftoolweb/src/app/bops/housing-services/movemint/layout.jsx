import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("movemint");

export default function MoveMintLayout({ children }) {
  return children;
}
