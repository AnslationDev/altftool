import { aiToolsPart1 } from "./aiToolsPart1";
import { aiToolsPart2 } from "./aiToolsPart2";

/**
 * Combined AI Tools directory — a platform-independent content type that
 * sits alongside the OS-specific settings data. Routed via the "ai-"
 * activeId prefix convention, mirroring the existing "util-" prefix used
 * for Help & Tools utility pages. Always visible regardless of the active
 * platform (Windows/macOS/Android/iOS), per the "AI Tools stay common
 * across platforms" requirement.
 */
export const aiTools = [...aiToolsPart1, ...aiToolsPart2];

export function getAiToolById(id) {
  return aiTools.find((tool) => tool.id === id) || null;
}
