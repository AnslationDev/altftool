"use client";
import dynamic from "next/dynamic";

const StartupNameGeneratorApp = dynamic(
  () => import("./pages"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-primary mb-4" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">
          Initializing Branding Suite...
        </span>
      </div>
    ),
  }
);

export default function ToolEntry() {
  return (
    <div className="bg-background">
      <StartupNameGeneratorApp />
    </div>
  );
}
