"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Top8Client from "../Top8Client";

export default function Top8CatchAllPage() {
  const pathname = usePathname() || "/top8";
  const searchParams = useSearchParams();
  const searchStr = searchParams?.toString();
  const fullPath = searchStr ? `${pathname}?${searchStr}` : pathname;

  return <Top8Client initialPath={fullPath} />;
}
