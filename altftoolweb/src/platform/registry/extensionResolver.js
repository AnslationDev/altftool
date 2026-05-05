import React from "react";
import { extensionMap } from "./extensionMap"; 

export function getExtension(slug) {
  console.log("Resolving extension:", slug);

  const importer = extensionMap[slug];

  console.log("Importer found:", !!importer);

  if (!importer) return null;

  return React.lazy(importer);
}
