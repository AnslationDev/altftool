"use client";

import dynamic from "next/dynamic";

const PestControlRouter = dynamic(() => import("./PestControlRouter"), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-[55vh] items-center justify-center bg-white text-sm font-medium text-slate-500"
      role="status"
    >
      Loading pest-control services...
    </div>
  ),
});

export default function PestControlPage() {
  return <PestControlRouter />;
}
