import { RouteLoadingShell } from "@/components/ui/route-loading";

// Was a hand-rolled skeleton on a hardcoded light palette (bg-[#fbfcff],
// bg-slate-200 bones, bg-white cards), so the route flashed a white page in
// dark mode. The sibling /apps listing already delegates to the shared shell.
export default function AppDetailLoading() {
  return <RouteLoadingShell variant="commerce" />;
}
