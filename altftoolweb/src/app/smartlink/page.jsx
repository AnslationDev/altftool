"use client";

import { useEffect } from "react";
import useHydrated from "@/hooks/useHydrated";

const REDIRECT_URL =
  "https://126d3999de4f.sunkissed-morn.com/?p=23600&media_type=mainstream";

const REDIRECT_URL_WITH_TYPE =
  "https://126d3999de4f.sunkissed-morn.com/?p=23600&media_type=mainstream&source_type=redirect";

const POPUNDER_SCRIPT =
  "https://scripts.sunkissed-morn.com/smart.popunder.js?p=23600&media_type=mainstream&source_type=popunder";

// 🔁 Loader
function InfiniteLoader() {
  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col justify-center items-center">
      <div
        style={{
          width: 64,
          height: 64,
          border: "3px solid #222",
          borderTop: "3px solid #e5c97e",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
          marginBottom: 32,
        }}
      />
      <p className="text-[#e5c97e] tracking-widest uppercase text-sm">
        Loading...
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function SmartLink() {
  const hydrated = useHydrated();
  const mode = hydrated
    ? (new URLSearchParams(window.location.search).get("mode") || "").toLowerCase()
    : "";

  useEffect(() => {
    // 🚀 direct redirect
    if (mode === "direct") {
      window.location.replace(REDIRECT_URL);
      return;
    }

    // 🚀 redirect (meta equivalent)
    if (mode === "redirect") {
      window.location.replace(REDIRECT_URL_WITH_TYPE);
      return;
    }

    // ⚡ popunder
    if (mode === "pus") {
      const script = document.createElement("script");
      script.src = POPUNDER_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [mode]);

  // 🔁 No mode → infinite loader
  if (!mode) {
    return <InfiniteLoader />;
  }

  // 🔁 redirect modes → show loader briefly
  if (mode === "direct" || mode === "redirect") {
    return <InfiniteLoader />;
  }

  // 🔘 Button mode
  if (mode === "btn") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <a
          href={REDIRECT_URL}
          className="bg-[var(--primary)] text-2xl md:text-4xl px-8 py-4 text-white rounded-xl font-bold"
        >
          Click here
        </a>
      </div>
    );
  }

  // 🔁 PUS mode (script already injected)
  if (mode === "pus") {
    return <InfiniteLoader />;
  }

  // 🔁 fallback
  return <InfiniteLoader />;
}
