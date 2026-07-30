import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";

/**
 * These routes render their own chrome, so the global header never mounts here.
 * Without a launcher the only way back to the rest of the site was the browser's
 * Back button — a dead end for anyone who arrived from search.
 */
export default function PatatapLayout({ children }) {
  return (
    <>
      {children}
      <AltfLauncher />
    </>
  );
}
