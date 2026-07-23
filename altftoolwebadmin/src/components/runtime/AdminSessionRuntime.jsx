"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

const SecurityGate = dynamic(
  () => import("@/components/security/SecurityGate"),
  { ssr: false },
);
const PushToastHost = dynamic(() => import("@/components/ui/PushToastHost"), {
  ssr: false,
});

export default function AdminSessionRuntime() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <>
      <PushToastHost />
      {user.isLocalAdmin ? null : <SecurityGate />}
    </>
  );
}
