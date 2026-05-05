"use client";

import ToolDetailChrome from "./ToolDetailChrome";
import ApiStressTool from "@/tools/api-stress-estimator/entry";

export default function ApiStressToolClient({ category = "all" }) {
  return (
    <ToolDetailChrome slug="api-stress-estimator" category={category}>
      <ApiStressTool />
    </ToolDetailChrome>
  );
}
