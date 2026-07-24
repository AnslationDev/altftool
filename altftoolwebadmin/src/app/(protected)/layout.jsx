"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminSessionRuntime from "@/components/runtime/AdminSessionRuntime";

export default function ProtectedLayout({ children }) {
  return (
    <>
      <AdminSessionRuntime />
      <AdminLayout>{children}</AdminLayout>
    </>
  );
}
