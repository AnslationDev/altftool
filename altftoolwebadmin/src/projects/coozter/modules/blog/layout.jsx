"use client";

import CkeditorAssets from "@/components/admin/CkeditorAssets";

export default function CoozterBlogLayout({ children }) {
  return (
    <>
      <CkeditorAssets force />
      {children}
    </>
  );
}
