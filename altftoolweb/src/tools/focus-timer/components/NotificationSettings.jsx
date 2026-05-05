"use client"

import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

export default function NotificationSettings() {
  const [permission, setPermission] = useState(
    typeof window !== "undefined" ? Notification.permission : "default",
  );

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <div className="bg-(--background) border border-(--border) rounded-xl px-4 py-3 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-2">
        <div >
          <p className="text-sm font-bold font-primary text-(--foreground) inline-flex gap-2">
            <span>
              {" "}
              {permission === "granted" ? (
                <Bell size={16} className="text-(--primary) shrink-0" />
              ) : (
                <BellOff
                  size={16}
                  className="text-(--muted-foreground) shrink-0"
                />
              )}
            </span>{" "}
            Notifications
          </p>
          <p className="text-xs font-secondary text-(--muted-foreground)">
            {permission === "granted" && "Enabled — you'll get session alerts"}
            {permission === "denied" && "Blocked — allow in browser settings"}
            {permission === "default" && "Not set — click Enable to turn on"}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      {permission === "granted" && (
        <span className="text-xs font-primary font-bold text-green-500 border border-green-200 sm:px-3 px-2 py-1 rounded-full">
          Active
        </span>
      )}

      {permission === "default" && (
        <button
          onClick={requestPermission}
          className="text-xs font-primary font-bold text-(--primary) border border-(--primary) px-3 py-1.5 rounded-lg cursor-pointer bg-transparent hover:bg-(--muted) transition-all"
        >
          Enable
        </button>
      )}

      {permission === "denied" && (
        <span className="text-xs font-primary font-bold text-red-400 border border-red-200 px-3 py-1 rounded-full">
          Blocked
        </span>
      )}
    </div>
  );
}
