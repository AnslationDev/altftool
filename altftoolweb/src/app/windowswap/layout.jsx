import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";

/**
 * Self-chrome route: the global header never mounts here, and every internal
 * link in this subtree points back into the microsite. Without a launcher the
 * browser's Back button was the only way out for a visitor from search.
 */
export default function WindowSwapLayout({ children }) {
  return (
    <>
      {children}
      <AltfLauncher />
    </>
  );
}
