"use client";

import CkeditorAssets from "@/components/admin/CkeditorAssets";

export default function CareerBookBlogLayout({ children }) {
  return (
    <>
      <CkeditorAssets force />
      {children}
    </>
  );
}
