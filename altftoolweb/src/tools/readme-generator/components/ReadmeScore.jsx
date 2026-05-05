"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ReadmeScore({ generatedReadme }) {
  if (!generatedReadme) return null;

  let score = 0;
  const suggestions = [];

  const hasTitle = generatedReadme.startsWith("# ");
  const hasDescription = generatedReadme.includes("## Overview");
  const hasInstallation = generatedReadme.includes("## Installation");
  const hasUsage = generatedReadme.includes("## Usage");
  const hasScreenshots =
    generatedReadme.toLowerCase().includes("screenshot") ||
    generatedReadme.includes("!["); 

  if (hasTitle) score += 20;
  else suggestions.push("Add project title");

  if (hasDescription) score += 20;
  else suggestions.push("Add project description");

  if (hasInstallation) score += 20;
  else suggestions.push("Add installation steps");

  if (hasUsage) score += 20;
  else suggestions.push("Add usage instructions");

  if (hasScreenshots) score += 20;
  else suggestions.push("Add screenshots");

  return (
    <div className="mb-4 p-4 border border-(--border) rounded-xl bg-(--card)">
      
    
      <div className="flex items-center justify-between mb-2 gap-2 ">
        <h3 className="font-semibold text-(--foreground)">
           README Score  
        </h3>
        <span className="text-sm font-bold text-(--primary) ">
          {score}/100
        </span>
      </div>

    
      <div className="w-full h-2 bg-(--muted) rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-(--primary) transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

    
      {suggestions.length > 0 && (
        <div className="space-y-1">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-(--muted-foreground)"
            >
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

    
      {score === 100 && (
        <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
          <CheckCircle2 className="w-4 h-4" />
          Perfect README 🎉
        </div>
      )}
    </div>
  );
}