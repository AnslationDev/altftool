"use client";

import { useEffect, useState } from "react";

export default function LazyChatBot() {
  const [ChatBot, setChatBot] = useState(null);

  useEffect(() => {
    let mounted = true;

    import("./index")
      .then((module) => {
        if (mounted) setChatBot(() => module.default || module);
      })
      .catch((error) => {
        console.error("LazyChatBot load failed:", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ChatBot) return null;
  return <ChatBot />;
}
