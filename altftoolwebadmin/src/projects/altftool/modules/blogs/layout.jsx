"use client";

import CkeditorAssets from "@/components/admin/CkeditorAssets";
import BlogTopBar from "./components/BlogTopBar";

export default function BlogsLayout({ children }) {

  return (

    <div className="min-h-screen bg-surface-soft">

      <CkeditorAssets />

      {/* Top Navigation */}

      <BlogTopBar />

      {/* Page Content */}

      <div className="mx-auto px-6 py-6">

        {children}

      </div>

    </div>

  );

}
