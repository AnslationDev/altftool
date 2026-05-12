"use client";

import OurTeamTopBar from "./components/OurTeamTopBar";

export default function OurTeamLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}

      <OurTeamTopBar />

      {/* Page Content */}

      <div className="mx-auto px-6 py-6">{children}</div>
    </div>
  );
}
