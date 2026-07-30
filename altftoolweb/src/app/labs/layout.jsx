import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";

/**
 * Labs is a primary nav destination that renders its own focused header, so a
 * visitor who clicks it loses the site nav they arrived with. /bops — the other
 * self-chrome primary destination — already mounts the launcher; this gives
 * Labs the same way back rather than changing either one's design.
 */
export default function LabsLayout({ children }) {
  return (
    <>
      {children}
      <AltfLauncher />
    </>
  );
}
