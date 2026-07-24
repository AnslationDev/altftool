"use client";

import ToolRuntime from "@/tools/_shared/toolkit/ToolRuntime";
import { spec } from "../spec";

export default function Page() {
  return <ToolRuntime spec={spec} />;
}
