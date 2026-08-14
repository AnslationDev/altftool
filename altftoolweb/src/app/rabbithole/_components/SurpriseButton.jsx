"use client";

import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";

/**
 * Deliberately a client component with the slug list passed in, rather than a
 * /random route that redirects. A redirect route cannot be statically rendered
 * and would put a server round trip in front of what should feel instant.
 */
export default function SurpriseButton({ slugs, className = "", children }) {
  const router = useRouter();

  function go() {
    if (!slugs.length) return;
    const pick = slugs[Math.floor(Math.random() * slugs.length)];
    router.push(`/rabbithole/site/${pick}`);
  }

  return (
    <button type="button" onClick={go} className={className}>
      <Shuffle className="h-4 w-4" aria-hidden="true" />
      {children || "Surprise me"}
    </button>
  );
}
