"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ActivitySquare, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { SectionHeader } from "@altftool/ui";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

/**
 * "System Status" here means two honest things: (1) the real, live status
 * of THIS SITE (linking to the already-existing /status page — not a
 * fabricated new one), and (2) the real connectivity status of the current
 * browser. It intentionally does not show fake CPU/RAM numbers, since a
 * website has no way to read a visitor's actual system resource usage.
 */
const SystemStatusPanel = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <section className="support-utility-section" aria-label="System status">
      <SectionHeader
        title="System Status"
        description="Your connection right now, and the live status of AltFTool itself."
      />

      <div className="support-status-row">
        <div className={`support-status-pill ${online ? "support-status-online" : "support-status-offline"}`}>
          {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {online ? "Your connection is online" : "You appear to be offline"}
        </div>

        <Link href={SITE_ROUTES.status.href} className="support-status-link">
          <ActivitySquare className="h-4 w-4" />
          View AltFTool status page
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
};

export default SystemStatusPanel;
