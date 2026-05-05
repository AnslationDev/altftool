"use client";

import { useSearchParams } from "next/navigation";
import RedirectLoader from "../components/RedirectLoader";

export default function RedirectClient() {
  const params = useSearchParams();
  const url = params.get("url");

  if (!url) return null;

  return <RedirectLoader url={url} />;
}
