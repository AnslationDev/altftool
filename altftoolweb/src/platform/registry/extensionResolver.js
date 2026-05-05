import React from "react";
import { extensionMap } from "./extensionMap"; 

export function getExtension(slug) {
  const importer = extensionMap[slug];

  if (!importer) return null;

  return React.lazy(importer);
}
