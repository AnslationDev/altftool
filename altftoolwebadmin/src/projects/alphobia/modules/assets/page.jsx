"use client";

import React from "react";
import AssetsTab from "../editor/components/AssetsTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function AssetsPage() {
  return (
    <AlphobiaModuleLayout
      title="Assets & Media Library"
      subtitle="Upload or delete design files, retrieve asset reference URLs from Firebase Storage, and view dummy database structures."
    >
      <AssetsTab />
    </AlphobiaModuleLayout>
  );
}
