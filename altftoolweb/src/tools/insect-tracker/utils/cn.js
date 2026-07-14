import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tiny class-name helper used across the tool's components.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
