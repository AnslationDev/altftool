"use client";

import AdminLayout from "@/components/admin/AdminLayout";

export default function ProtectedLayout({ children }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
