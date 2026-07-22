import "../globals.css";
import React from "react";

export const metadata = {
  title: "AltF Code Theater | Cinematic Terminal Simulator",
  description: "Run fictional cinematic terminal interfaces for demos, streams, and harmless creative play.",
  alternates: { canonical: "/geektyper" },
};

export default function CodeTheaterLayout({ children }) {
  return (
    <div
      className="geek2-root-sandbox flex min-h-screen w-screen flex-col justify-between overflow-hidden bg-background text-primary antialiased selection:bg-primary/30"
      style={{ colorScheme: "dark" }}
    >
      {/* Main viewport only; global footer comes from the root layout. */}
      <div className="flex-1 w-full relative min-h-0">{children}</div>
    </div>
  );
}
